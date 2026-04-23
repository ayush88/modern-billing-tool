"""Pydantic v2 request/response schemas — mirrors src/lib/types.ts exactly."""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict


# ── Fuel ──────────────────────────────────────────────────────────────────────

class FuelReceiptIn(BaseModel):
    """Matches the FuelReceipt TypeScript interface."""
    stationName: str
    addressLine1: str
    addressLine2: str
    gstNo: str
    telNo: str
    receiptNo: str
    product: Literal["Petrol", "Diesel"]
    rate: float
    volume: float
    total: float
    dateTime: str                            # ISO local string e.g. "2026-04-22T14:30"
    paymentMode: Literal["Online", "Cash", "Card"]
    vehicleType: str = ""
    vehicleNo: str = ""
    customerName: str = ""


class FuelReceiptOut(FuelReceiptIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

    # Alias ORM snake_case → camelCase
    @classmethod
    def from_orm_row(cls, row) -> "FuelReceiptOut":
        return cls(
            id=row.id,
            created_at=row.created_at,
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


# ── Driver ────────────────────────────────────────────────────────────────────

class DriverSalaryIn(BaseModel):
    """Matches the DriverSalary TypeScript interface."""
    employerName: str
    driverName: str
    vehicleNo: str
    salaryMonth: str
    salaryYear: str
    paymentDate: str                         # yyyy-mm-dd
    amount: float
    signatureDataUrl: Optional[str] = None  # base64 PNG data URL


class DriverSalaryOut(DriverSalaryIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

    @classmethod
    def from_orm_row(cls, row) -> "DriverSalaryOut":
        return cls(
            id=row.id,
            created_at=row.created_at,
            employerName=row.employer_name,
            driverName=row.driver_name,
            vehicleNo=row.vehicle_no,
            salaryMonth=row.salary_month,
            salaryYear=row.salary_year,
            paymentDate=row.payment_date,
            amount=row.amount,
            signatureDataUrl=row.signature_data_url,
        )


# ── Shared ─────────────────────────────────────────────────────────────────────

class SaveResponse(BaseModel):
    id: int
    created_at: datetime
