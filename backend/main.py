"""
FastAPI application entry point.
All routes live under /api/* to allow Vite proxy forwarding in dev.

Run:
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import FuelBill, DriverBill
from schemas import (
    FuelReceiptIn, FuelReceiptOut,
    DriverSalaryIn, DriverSalaryOut,
    SaveResponse,
)
from pdf_fuel import generate_fuel_pdf
from pdf_driver import generate_driver_pdf

# ── Create tables on startup ──────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Billing Tool API",
    description="Backend for driver salary and fuel receipt generation",
    version="1.0.0",
)

# Allow Vite dev server origin (in production serve from same origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}


# ═══════════════════════════════════════════════════════════════════════════════
#  FUEL RECEIPTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/fuel", response_model=SaveResponse, status_code=201, tags=["fuel"])
def create_fuel_bill(payload: FuelReceiptIn, db: Session = Depends(get_db)):
    """Persist a new fuel receipt and return its id + timestamp."""
    bill = FuelBill(
        station_name=payload.stationName,
        address_line1=payload.addressLine1,
        address_line2=payload.addressLine2,
        gst_no=payload.gstNo,
        tel_no=payload.telNo,
        receipt_no=payload.receiptNo,
        product=payload.product,
        rate=payload.rate,
        volume=payload.volume,
        total=payload.total,
        date_time=payload.dateTime,
        payment_mode=payload.paymentMode,
        vehicle_type=payload.vehicleType,
        vehicle_no=payload.vehicleNo,
        customer_name=payload.customerName,
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return SaveResponse(id=bill.id, created_at=bill.created_at)


@app.get("/api/fuel", response_model=list[FuelReceiptOut], tags=["fuel"])
def list_fuel_bills(db: Session = Depends(get_db)):
    """Return all fuel bills, newest first."""
    rows = db.query(FuelBill).order_by(FuelBill.id.desc()).all()
    return [FuelReceiptOut.from_orm_row(r) for r in rows]


@app.get("/api/fuel/{bill_id}", response_model=FuelReceiptOut, tags=["fuel"])
def get_fuel_bill(bill_id: int, db: Session = Depends(get_db)):
    """Return a single fuel bill by id."""
    row = db.get(FuelBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Fuel bill not found")
    return FuelReceiptOut.from_orm_row(row)


@app.get("/api/fuel/{bill_id}/pdf", tags=["fuel"])
def download_fuel_pdf(bill_id: int, db: Session = Depends(get_db)):
    """Generate and stream the PDF for a saved fuel receipt."""
    row = db.get(FuelBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Fuel bill not found")

    data = FuelReceiptIn(
        stationName=row.station_name,
        addressLine1=row.address_line1,
        addressLine2=row.address_line2,
        gstNo=row.gst_no,
        telNo=row.tel_no,
        receiptNo=row.receipt_no,
        product=row.product,
        rate=row.rate,
        volume=row.volume,
        total=row.total,
        dateTime=row.date_time,
        paymentMode=row.payment_mode,
        vehicleType=row.vehicle_type or "",
        vehicleNo=row.vehicle_no or "",
        customerName=row.customer_name or "",
    )
    pdf_bytes = generate_fuel_pdf(data)
    filename = f"Fuel_Receipt_{row.receipt_no}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.delete("/api/fuel/{bill_id}", status_code=204, tags=["fuel"])
def delete_fuel_bill(bill_id: int, db: Session = Depends(get_db)):
    """Delete a saved fuel bill."""
    row = db.get(FuelBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Fuel bill not found")
    db.delete(row)
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════════
#  DRIVER SALARY SLIPS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/driver", response_model=SaveResponse, status_code=201, tags=["driver"])
def create_driver_bill(payload: DriverSalaryIn, db: Session = Depends(get_db)):
    """Persist a new driver salary slip and return its id + timestamp."""
    bill = DriverBill(
        employer_name=payload.employerName,
        driver_name=payload.driverName,
        vehicle_no=payload.vehicleNo,
        salary_month=payload.salaryMonth,
        salary_year=payload.salaryYear,
        payment_date=payload.paymentDate,
        amount=payload.amount,
        signature_data_url=payload.signatureDataUrl,
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return SaveResponse(id=bill.id, created_at=bill.created_at)


@app.get("/api/driver", response_model=list[DriverSalaryOut], tags=["driver"])
def list_driver_bills(db: Session = Depends(get_db)):
    """Return all driver salary slips, newest first."""
    rows = db.query(DriverBill).order_by(DriverBill.id.desc()).all()
    return [DriverSalaryOut.from_orm_row(r) for r in rows]


@app.get("/api/driver/{bill_id}", response_model=DriverSalaryOut, tags=["driver"])
def get_driver_bill(bill_id: int, db: Session = Depends(get_db)):
    """Return a single driver salary slip by id."""
    row = db.get(DriverBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Driver bill not found")
    return DriverSalaryOut.from_orm_row(row)


@app.get("/api/driver/{bill_id}/pdf", tags=["driver"])
def download_driver_pdf(bill_id: int, db: Session = Depends(get_db)):
    """Generate and stream the PDF for a saved driver salary slip."""
    row = db.get(DriverBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Driver bill not found")

    data = DriverSalaryIn(
        employerName=row.employer_name,
        driverName=row.driver_name,
        vehicleNo=row.vehicle_no,
        salaryMonth=row.salary_month,
        salaryYear=row.salary_year,
        paymentDate=row.payment_date,
        amount=row.amount,
        signatureDataUrl=row.signature_data_url,
    )
    pdf_bytes = generate_driver_pdf(data)
    filename = f"Driver_Salary_{row.salary_month}_{row.salary_year}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.delete("/api/driver/{bill_id}", status_code=204, tags=["driver"])
def delete_driver_bill(bill_id: int, db: Session = Depends(get_db)):
    """Delete a saved driver salary slip."""
    row = db.get(DriverBill, bill_id)
    if not row:
        raise HTTPException(status_code=404, detail="Driver bill not found")
    db.delete(row)
    db.commit()
