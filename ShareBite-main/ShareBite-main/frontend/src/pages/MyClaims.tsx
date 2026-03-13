import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Card, Modal, Row, Col } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../api/api';
import type { Claim, Listing } from '../types';
import { FaHistory, FaTimesCircle, FaMapMarkerAlt, FaUtensils, FaClock, FaInfoCircle, FaPhone, FaEnvelope } from 'react-icons/fa';
import L from 'leaflet';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MyClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims/my-claims');
      setClaims(response.data);
    } catch (err) {
      setError('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = async (listingId: number) => {
    setShowModal(true);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/listings/${listingId}`);
      setSelectedListing(response.data);
    } catch (err) {
      console.error("Failed to fetch listing details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedListing(null);
  };

  const handleCancel = async (claimId: number) => {
    if (window.confirm('Are you sure you want to cancel this claim?')) {
      try {
        await api.put(`/claims/cancel/${claimId}`);
        fetchClaims();
      } catch (err: any) {
        alert(err.response?.data || 'Failed to cancel claim.');
      }
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Container className="py-4 fade-in">
      <h2 className="fw-bold mb-4">My Claims</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {claims.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <FaHistory size={40} className="text-muted mb-3" />
            <p className="text-muted">You haven't claimed any food yet.</p>
            <Button variant="success" href="/available" className="rounded-pill px-4">Browse Available Food</Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="py-3">Status</th>
                <th className="py-3">Claim Date</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr 
                  key={claim.id} 
                  className="align-middle" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleShowDetails(claim.listingId)} // Click whole row to open modal
                >
                  <td className="px-4">
                    <div className="fw-bold text-success">
                      #{claim.listingId} <FaInfoCircle className="ms-1 small text-muted" />
                    </div>
                  </td>
                  <td>
                    <Badge bg={
                      claim.status === 'FULFILLED' ? 'success' : 
                      claim.status === 'CANCELLED' ? 'danger' : 'primary'
                    }>
                      {claim.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>{new Date(claim.claimTime).toLocaleString()}</td>
                  <td className="px-4 text-end">
                    {claim.status === 'PENDING_PICKUP' && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="rounded-pill"
                        onClick={(e) => {
                          e.stopPropagation(); // Stops the modal from opening when clicking cancel
                          handleCancel(claim.id);
                        }}
                      >
                        <FaTimesCircle className="me-1" /> Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Listing Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-success">
            {detailsLoading ? 'Loading Details...' : selectedListing?.name || 'Listing Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailsLoading ? (
             <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : selectedListing ? (
            <Row>
              <Col md={5} className="mb-3 mb-md-0 d-flex flex-column gap-3">
                <div className="rounded overflow-hidden shadow-sm border" style={{ height: '220px' }}>
                  <img 
                    src={selectedListing.photoUrl || 'https://via.placeholder.com/400x300?text=Food'} 
                    alt={selectedListing.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                {selectedListing.latitude !== 0 && (
                  <div className="rounded overflow-hidden shadow-sm border" style={{ height: '220px' }}>
                     <MapContainer 
                        center={[selectedListing.latitude, selectedListing.longitude]} 
                        zoom={15} 
                        scrollWheelZoom={false} 
                        style={{ height: '100%', width: '100%' }}
                     >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[selectedListing.latitude, selectedListing.longitude]}>
                            <Popup>Pickup Location</Popup>
                        </Marker>
                     </MapContainer>
                  </div>
                )}
              </Col>
              <Col md={7}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Badge bg="success" className="mb-2">{selectedListing.type}</Badge>
                  <span className="text-muted small">Listing ID: #{selectedListing.id}</span>
                </div>
                
                <h4 className="fw-bold mb-1">{selectedListing.name}</h4>
                <p className="text-muted mb-3 small">{selectedListing.description}</p>
                
                <div className="mb-2">
                  <FaUtensils className="text-success me-2" />
                  <strong>Servings:</strong> {selectedListing.servings}
                </div>
                
                <div className="mb-2">
                  <FaMapMarkerAlt className="text-danger me-2" />
                  <strong>Address:</strong> {selectedListing.address}
                </div>
                
                <div className="mb-4">
                  <FaClock className="text-primary me-2" />
                  <strong>Claim By:</strong> {new Date(selectedListing.claimByTime).toLocaleString()}
                </div>

                <div className="p-3 bg-light rounded border shadow-sm">
                   <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Pickup Contact Information</h6>
                   <div className="small">
                     <p className="mb-2"><FaInfoCircle className="me-2 text-muted" /><strong>Donor:</strong> {selectedListing.donorName || 'Shared User'}</p>
                     <p className="mb-2"><FaEnvelope className="me-2 text-muted" /><strong>Email:</strong> <a href={`mailto:${selectedListing.donorEmail}`} className="text-decoration-none">{selectedListing.donorEmail || 'N/A'}</a></p>
                     <p className="mb-0"><FaPhone className="me-2 text-muted" /><strong>Phone:</strong> <a href={`tel:${selectedListing.phoneNumber}`} className="text-decoration-none fw-bold text-success">{selectedListing.phoneNumber}</a></p>
                   </div>
                </div>
              </Col>
            </Row>
          ) : (
            <p className="text-center text-muted">Details not available.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleCloseModal} className="rounded-pill px-4">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyClaims;