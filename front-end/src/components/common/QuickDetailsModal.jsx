import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { getServiceById } from "../../api/serviceApi";
import { getVenueById } from "../../api/venueApi";
import "./QuickDetailsModal.css";

const SERVICE_CATEGORIES = [
  { value: "CATERING", label: "Catering Services" },
  { value: "DECOR_AND_STYLING", label: "Decor and Styling" },
  { value: "AUDIO_VISUAL", label: "Audio Visual Services" },
  { value: "FURNITURE_RENTAL", label: "Furniture & Equipment Rental" },
];

const formatServiceCategory = (val) =>
  SERVICE_CATEGORIES.find((c) => c.value === val)?.label || val || "—";

const formatVenueType = (type) => {
  switch (type) {
    case "VILLA": return "Villa";
    case "CHALET": return "Chalet";
    case "SCHOOL_HALL": return "School Hall";
    default:
      return (type || "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
  }
};

const formatEventType = (type) => {
  if (!type) return "—";
  const m = {
    WEDDING: "Wedding",
    ENGAGEMENT_PARTY: "Engagement Party",
    BIRTHDAY_PARTY: "Birthday Party",
    FAMILY_REUNION: "Family Reunion",
    PRIVATE_DINNER: "Private Dinner",
    RETREAT: "Retreat",
    BACHELORETTE_PARTY: "Bachelorette Party",
    BABY_SHOWER: "Baby Shower",
    CONFERENCE: "Conference",
    WORKSHOP: "Workshop",
    SEMINAR: "Seminar",
    CORPORATE_DINNER: "Corporate Dinner",
    NETWORKING_EVENT: "Networking Event",
    PRODUCT_LAUNCH: "Product Launch",
    AWARD_CEREMONY: "Award Ceremony",
    FASHION_SHOW: "Fashion Show",
    BUSINESS_EXPO: "Business Expo",
    FUNDRAISER: "Fundraiser",
  };
  return m[type] || type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const getImageUrl = (img) => {
  if (typeof img !== "string") return null;
  if (img.startsWith("data:") || img.startsWith("http")) return img;
  return `data:image/jpeg;base64,${img}`;
};

export default function QuickDetailsModal({ open, type, itemId, onClose, fallbackItem, onProceed }) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!open || !itemId) return;
    setLoading(true);
    try {
      if (type === "service") {
        const data = await getServiceById(itemId);
        setItem(data);
      } else if (type === "venue") {
        const data = await getVenueById(itemId);
        setItem(data);
      }
    } catch (e) {
      console.error("QuickDetailsModal load error:", e);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [open, itemId, type]);

  useEffect(() => { load(); }, [load]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const data = item || fallbackItem || null;
  const images = (data?.images || []).map(getImageUrl).filter(Boolean);
  
    const handleProceed = async () => {
        if (!onProceed) return;
        try {
          setSubmitting(true);

          await onProceed(data);
        } finally {
          setSubmitting(false);
        }
      };
    
      return (
        <div className="qd-overlay" onClick={() => { if (!submitting) onClose(); }}>
          <div className="qd-card" onClick={(e) => e.stopPropagation()} aria-busy={submitting}>

        <button className="qd-close" onClick={onClose} aria-label="Close">×</button>

        {loading ? (
          <div className="qd-loading">Loading...</div>
        ) : !data ? (
          <div className="qd-empty">Not found.</div>
        ) : (
          <>
            {/* Title */}
            <div className="qd-header">
              <h2 className="qd-title">{data.name || "Untitled"}</h2>
              <div className="qd-sub">
                {type === "service" ? (
                  <>
                    <span className="qd-tag">{formatServiceCategory(data.type)}</span>
                    {data.price != null && <span className="qd-dot">•</span>}
                    {data.price != null && <span className="qd-meta">${data.price}</span>}
                  </>
                ) : (
                  <>
                    <span className="qd-tag">{formatVenueType(data.type)}</span>
                    {data?.pricing && (data.pricing.perHour ||data.pricing.perEvent) && (
                      <>
                        <span className="qd-dot">•</span>
                        <span className="qd-meta">
                          {data.pricing.perHour ? `$${data.pricing.perHour}/hr` : ""}
                          {data.pricing.perHour && data.pricing.perEvent ? " | " : ""}
                          {data.pricing.perEvent ? `$${data.pricing.perEvent}/event` : ""}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className="qd-images">
                <div className="qd-main-img">
                  <img src={images[current]} alt={data.name} />
                </div>
                {images.length > 1 && (
                  <div className="qd-thumbs">
                    {images.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`${data.name} ${idx + 1}`}
                        className={idx === current ? "active" : ""}
                        onClick={() => setCurrent(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info grid (NO availability here) */}
            <div className="qd-info">
              {type === "service" ? (
                <>
                  <div>
                    <div className="qd-label">Category</div>
                    <div className="qd-value">{formatServiceCategory(data.type)}</div>
                  </div>
                  <div>
                    <div className="qd-label">Locations</div>
                    <div className="qd-value">
                      {Array.isArray(data.servicesAreas) ? data.servicesAreas.join(", ") : (data.location || "—")}
                    </div>
                  </div>
                  <div className="qd-span">
                    <div className="qd-label">Description</div>
                    <div className="qd-value">{data.description || "—"}</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="qd-label">Location</div>
                    <div className="qd-value">{data.location || "—"}</div>
                  </div>
                  <div>
                    <div className="qd-label">Capacity</div>
                    <div className="qd-value">
                      {data.capacity
                        ? `${data.capacity?.minCapacity || 0}–${data.capacity?.maxCapacity || 0} people`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="qd-label">Event Types</div>
                    <div className="qd-value">
                      {Array.isArray(data.eventTypes) && data.eventTypes.length
                        ? data.eventTypes.map(formatEventType).join(", ")
                        : "—"}
                    </div>
                  </div>
                  <div className="qd-span">
                    <div className="qd-label">Description</div>
                    <div className="qd-value">{data.description || "—"}</div>
                  </div>
                </>
              )}
            </div>
          <div className="qd-actions" style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="event-btn secondary" onClick={onClose} disabled={submitting}>
                Close
              </button>
              <button
                className="event-btn success"
                onClick={handleProceed}
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1, pointerEvents: submitting ? "none" : "auto" }}
              >
                {submitting ? "Processing…" : "Proceed to Payment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

QuickDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(["service", "venue"]).isRequired,
  itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func.isRequired,
};
