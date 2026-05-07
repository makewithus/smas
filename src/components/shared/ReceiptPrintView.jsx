"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";

function numToWords(n) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000)
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + numToWords(n % 100) : "")
    );
  if (n < 100000)
    return (
      numToWords(Math.floor(n / 1000)) +
      " Thousand" +
      (n % 1000 ? " " + numToWords(n % 1000) : "")
    );
  return (
    numToWords(Math.floor(n / 100000)) +
    " Lakh" +
    (n % 100000 ? " " + numToWords(n % 100000) : "")
  );
}

export default function ReceiptPrintView({ receipt = {} }) {
  const {
    receiptNumber,
    date,
    studentName,
    studentId,
    className,
    amount = 0,
    description,
    paymentMethod,
    notes,
  } = receipt;
  const amountInWords = numToWords(Math.round(amount)) + " Rupees Only";

  return (
    <div>
      <div className="no-print flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded"
          style={{ background: "#1B4332" }}
        >
          <Printer size={15} /> Print Receipt
        </button>
      </div>

      <div
        id="receipt-content"
        className="bg-white"
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "32px",
          border: "1px solid #E8DFD4",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "2px solid #1B4332",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1B4332",
              letterSpacing: "1px",
            }}
          >
            STUDENT ADMINISTRATION SYSTEM
          </h1>
          <p style={{ fontSize: "12px", color: "#8C7B6B", marginTop: "4px" }}>
            Official Fee Receipt
          </p>
        </div>

        {/* Receipt meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#8C7B6B" }}>Receipt No.</p>
            <p
              style={{ fontSize: "14px", fontWeight: "600", color: "#3D3227" }}
            >
              {receiptNumber || "—"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "#8C7B6B" }}>Date</p>
            <p
              style={{ fontSize: "14px", fontWeight: "600", color: "#3D3227" }}
            >
              {date
                ? new Date(
                    date.seconds ? date.seconds * 1000 : date,
                  ).toLocaleDateString("en-IN")
                : "—"}
            </p>
          </div>
        </div>

        {/* Student info */}
        <div
          style={{
            background: "#F5EFE8",
            borderRadius: "6px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8C7B6B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Student Name
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#3D3227",
                  fontWeight: "500",
                }}
              >
                {studentName || "—"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8C7B6B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Student ID
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#3D3227",
                  fontWeight: "500",
                }}
              >
                {studentId || "—"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8C7B6B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Class
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#3D3227",
                  fontWeight: "500",
                }}
              >
                {className || "—"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8C7B6B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Payment Method
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#3D3227",
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {paymentMethod || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#8C7B6B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Description
            </p>
            <p style={{ fontSize: "13px", color: "#3D3227" }}>{description}</p>
          </div>
        )}

        {/* Amount */}
        <div
          style={{
            border: "1px solid #1B4332",
            borderRadius: "6px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#3D3227" }}>
              Total Amount Received
            </p>
            <p
              style={{ fontSize: "22px", fontWeight: "700", color: "#1B4332" }}
            >
              ₹{Number(amount).toLocaleString("en-IN")}
            </p>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "#8C7B6B",
              marginTop: "4px",
              fontStyle: "italic",
            }}
          >
            {amountInWords}
          </p>
        </div>

        {notes && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#8C7B6B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Notes
            </p>
            <p style={{ fontSize: "12px", color: "#3D3227" }}>{notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            paddingTop: "32px",
            marginTop: "32px",
            borderTop: "1px solid #E8DFD4",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                borderBottom: "1px solid #3D3227",
                marginBottom: "6px",
                paddingBottom: "24px",
              }}
            ></div>
            <p style={{ fontSize: "11px", color: "#8C7B6B" }}>
              Student / Parent Signature
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                borderBottom: "1px solid #3D3227",
                marginBottom: "6px",
                paddingBottom: "24px",
              }}
            ></div>
            <p style={{ fontSize: "11px", color: "#8C7B6B" }}>
              Authorized Signatory
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: "10px",
            color: "#8C7B6B",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          This is a computer-generated receipt. No separate signature required.
        </p>
      </div>

      <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
    </div>
  );
}
