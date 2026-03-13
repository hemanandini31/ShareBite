import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../api/api';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaUtensils, FaClock } from 'react-icons/fa';

const AvailableFood: React.FC = () => {

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Listing detail modal
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // OTP modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpListingId, setOtpListingId] = useState<number | null>(null);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await api.get('/listings/available');
      setListings(response.data);
    } catch {
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedListing(null);
  };

  // STEP 1: Generate OTP
  const handleClaim = async (listingId: number) => {

    if (!isAuthenticated) {
      alert('Please login to claim food.');
      return;
    }

    setClaimingId(listingId);

    try {

      const res = await api.post(`/claims/initiate/${listingId}`);
      alert(res.data || "OTP sent to donor");

      setOtpListingId(listingId);
      setShowOtpModal(true);

    } catch (err: any) {

      alert(err.response?.data || "Failed to initiate claim");

    } finally {
      setClaimingId(null);
    }
  };

  // STEP 2: Verify OTP
  const verifyOtp = async () => {

    try {

      await api.post("/claims/verify-otp", {
        listingId: otpListingId,
        otp: otp
      });

      alert("Food claimed successfully!");

      setShowOtpModal(false);
      setShowModal(false);

      setOtp("");
      setOtpListingId(null);

      fetchListings();

    } catch (err: any) {

      alert(err.response?.data || "Invalid OTP");

    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Fetching fresh food...</p>
      </div>
    );

  return (
    <Container className="py-4 fade-in">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Available Food Near You</h2>
        <Badge bg="success" className="p-2 px-3 rounded-pill">
          {listings.length} items found
        </Badge>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {listings.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <FaUtensils size={50} className="text-muted mb-3" />
            <h3>No food available right now</h3>
            <p className="text-muted">Check back later.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {listings.map((listing) => (
            <Col key={listing.id} md={6} lg={4}>
              <Card
                className="h-100 shadow-sm border-0 hover-card"
                style={{ cursor: 'pointer' }}
                onClick={() => handleOpenDetails(listing)}
              >

                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={listing.photoUrl || 'https://via.placeholder.com/400x200'}
                    alt={listing.name}
                    className="w-100 h-100 object-fit-cover"
                  />

                  <Badge bg="success" className="position-absolute top-0 end-0 m-3 p-2">
                    {listing.type}
                  </Badge>
                </div>

                <Card.Body>

                  <div className="d-flex justify-content-between mb-2">
                    <Card.Title>{listing.name}</Card.Title>
                    <span className="text-success fw-bold small">
                      {listing.servings} Servings
                    </span>
                  </div>

                  <Card.Text className="text-muted small text-truncate">
                    {listing.description}
                  </Card.Text>

                  <div className="mb-3 small text-muted">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    {listing.address}
                  </div>

                  <Button
                    variant="success"
                    className="w-100 rounded-pill fw-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(listing.id);
                    }}
                    disabled={claimingId === listing.id}
                  >
                    {claimingId === listing.id ? 'Claiming...' : 'Claim Now'}
                  </Button>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* DETAILS MODAL */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Food Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedListing && (
            <Row>

              <Col md={6}>
                <img
                  src={selectedListing.photoUrl}
                  className="w-100 mb-3 rounded"
                />

                <MapContainer
                  center={[selectedListing.latitude, selectedListing.longitude]}
                  zoom={15}
                  style={{ height: '200px' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[selectedListing.latitude, selectedListing.longitude]}>
                    <Popup>{selectedListing.name}</Popup>
                  </Marker>
                </MapContainer>
              </Col>

              <Col md={6}>
                <h3>{selectedListing.name}</h3>

                <p>{selectedListing.description}</p>

                <p><FaUtensils /> Servings: {selectedListing.servings}</p>

                <p><FaMapMarkerAlt /> {selectedListing.address}</p>

                <p>
                  <FaClock /> Expiry:
                  {new Date(selectedListing.claimByTime).toLocaleString()}
                </p>

                {user?.role === 'RECIPIENT' && (
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={() => handleClaim(selectedListing.id)}
                  >
                    Confirm Claim
                  </Button>
                )}
              </Col>

            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* OTP MODAL */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>

        <Modal.Header closeButton>
          <Modal.Title>Enter OTP</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form.Control
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            className="mt-3 w-100"
            variant="success"
            onClick={verifyOtp}
          >
            Verify OTP
          </Button>

        </Modal.Body>

      </Modal>

    </Container>
  );
};

export default AvailableFood;