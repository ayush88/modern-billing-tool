"""SQLAlchemy ORM models — mirrors the TypeScript interfaces in src/lib/types.ts."""
from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class FuelBill(Base):
    """Mirrors FuelReceipt interface."""
    __tablename__ = "fuel_bills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Station info
    station_name: Mapped[str] = mapped_column(String(200))
    address_line1: Mapped[str] = mapped_column(String(200))
    address_line2: Mapped[str] = mapped_column(String(200))
    gst_no: Mapped[str] = mapped_column(String(50))
    tel_no: Mapped[str] = mapped_column(String(30))

    # Transaction
    receipt_no: Mapped[str] = mapped_column(String(50))
    product: Mapped[str] = mapped_column(String(20))   # "Petrol" | "Diesel"
    rate: Mapped[float] = mapped_column(Float)
    volume: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    date_time: Mapped[str] = mapped_column(String(30))   # ISO local string
    payment_mode: Mapped[str] = mapped_column(String(20))  # "Online"|"Cash"|"Card"

    # Vehicle / customer
    vehicle_type: Mapped[str] = mapped_column(String(100), default="")
    vehicle_no: Mapped[str] = mapped_column(String(50), default="")
    customer_name: Mapped[str] = mapped_column(String(200), default="")


class DriverBill(Base):
    """Mirrors DriverSalary interface."""
    __tablename__ = "driver_bills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employer_name: Mapped[str] = mapped_column(String(200))
    driver_name: Mapped[str] = mapped_column(String(200))
    vehicle_no: Mapped[str] = mapped_column(String(50))
    salary_month: Mapped[str] = mapped_column(String(20))
    salary_year: Mapped[str] = mapped_column(String(10))
    payment_date: Mapped[str] = mapped_column(String(20))   # yyyy-mm-dd
    amount: Mapped[float] = mapped_column(Float)
    signature_data_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
