import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, Spinner, ListGroup, Modal, Form } from 'react-bootstrap';
import api from '../api/api';
import type { Listing, Claim } from '../types';
import { FaCheckCircle, FaMapMarkerAlt, FaUtensils, FaEdit, FaUser, FaTrash, FaPhone } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyDonations: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Listing>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [listingsRes, claimsRes] = await Promise.all([
        api.get('/listings/my-donations'),
        api.get('/claims/donated-claims')
      ]);
      setListings(listingsRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Prevent negative servings in state
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;

    if (name === 'servings') {
      const num = parseFloat(value);
      // Logic to prevent negative or zero servings
      finalValue = num < 1 ? 1 : num; 
    }

    setEditFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    const loadingToast = toast.loading("Saving changes...");
    try {
      await api.put(`/listings/update/${editFormData.id}`, editFormData);
      toast.success("Update successful!", { id: loadingToast });
      setShowEditModal(false);
      setShowDetailModal(false); 
      fetchData();
    } catch (err: any) {
      toast.error("Update failed. Check your inputs.", { id: loadingToast });
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm("Delete this listing permanently?")) return;

    const loadingToast = toast.loading("Deleting...");
    try {
      await api.delete(`/listings/delete/${id}`);
      toast.success("Listing deleted", { id: loadingToast });
      setShowDetailModal(false); 
      fetchData();
    } catch (err) {
      toast.error("Delete failed. Item might be claimed.", { id: loadingToast });
    }
  };

  const handleFulfill = async (claimId: number) => {
    const loadingToast = toast.loading("Confirming pickup...");
    try {
      await api.put(`/claims/fulfill/${claimId}`);
      toast.success('Donation Fulfilled!', { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error('Fulfillment failed', { id: loadingToast });
    }
  };

  const activeListings = listings.filter(l => l.status !== 'COMPLETED');

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Donor Dashboard</h2>
      
      <Tabs defaultActiveKey="active" className="mb-4">
        {/* TAB 1: ACTIVE LISTINGS */}
        <Tab eventKey="active" title={`Active (${activeListings.length})`}>
          <Row className="g-4">
            {activeListings.length > 0 ? (
              activeListings.map((listing) => (
                <Col key={listing.id} md={6}>
                  <Card 
                    className="h-100 flex-row overflow-hidden border-0 shadow-sm shadow-hover" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedListing(listing); setShowDetailModal(true); }}
                  >
                    <div style={{ width: '140px' }}>
                      <img src={listing.photoUrl} alt="" className="w-100 h-100 object-fit-cover" />
                    </div>
                    <Card.Body className="p-3">
                      <h5 className="fw-bold mb-1">{listing.name}</h5>
                      <p className="text-muted small mb-2">{listing.type} • {listing.servings} servings</p>
                      <Badge bg={listing.status === 'AVAILABLE' ? 'success' : 'info'}>{listing.status}</Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col className="text-center py-5 text-muted">No active donations found.</Col>
            )}
          </Row>
        </Tab>

        {/* TAB 2: PICKUP REQUESTS (handleFulfill is used here) */}
        <Tab eventKey="claims" title={`Pickups (${claims.filter(c => c.status === 'PENDING_PICKUP').length})`}>
          {claims.filter(c => c.status === 'PENDING_PICKUP').length > 0 ? (
            claims.filter(c => c.status === 'PENDING_PICKUP').map((claim) => (
              <ListGroup.Item key={claim.id} className="p-3 mb-3 shadow-sm rounded border-0 bg-white d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold">{listings.find(l => l.id === claim.listingId)?.name}</h6>
                  <div className="small text-muted">
                    <p className="mb-0"><FaUser className="me-2 text-success" />{claim.recipientName}</p>
                    <p className="mb-0"><FaPhone className="me-2 text-primary" />{claim.recipientPhone}</p>
                  </div>
                </div>
                <Button variant="success" size="sm" onClick={() => handleFulfill(claim.id)}>Confirm Pickup</Button>
              </ListGroup.Item>
            ))
          ) : (
            <div className="text-center py-5 text-muted">No pending pickups.</div>
          )}
        </Tab>

        {/* TAB 3: HISTORY */}
        <Tab eventKey="history" title="History">
          <Row className="g-4">
            {claims.filter(c => c.status === 'FULFILLED').map((claim) => (
              <Col key={claim.id} md={6}>
                <Card className="p-3 border-0 shadow-sm bg-light">
                  <h6 className="fw-bold mb-1">{listings.find(l => l.id === claim.listingId)?.name}</h6>
                  <p className="small text-success mb-0"><FaCheckCircle className="me-1"/> Delivered to {claim.recipientName}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>

      {/* DETAILS MODAL (Edit/Delete inside here) */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        {selectedListing && (
          <>
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold">Donation Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
              <Row>
                <Col md={5}>
                  <img src={selectedListing.photoUrl} className="img-fluid rounded shadow-sm mb-3" alt="" />
                </Col>
                <Col md={7}>
                  <h3 className="fw-bold">{selectedListing.name}</h3>
                  <Badge bg="success" className="mb-3">{selectedListing.status}</Badge>
                  <p className="text-muted mb-4">{selectedListing.description}</p>
                  
                  <div className="d-flex flex-column gap-2 small">
                    <span><FaUtensils className="me-2 text-success"/> <strong>Type:</strong> {selectedListing.type}</span>
                    <span><FaUser className="me-2 text-success"/> <strong>Servings:</strong> {selectedListing.servings}</span>
                    <span><FaMapMarkerAlt className="me-2 text-success"/> <strong>Address:</strong> {selectedListing.address}</span>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 px-4 justify-content-start">
              <Button 
                variant="outline-primary" 
                className="rounded-pill px-4"
                onClick={() => {
                  setEditFormData({ ...selectedListing });
                  setShowEditModal(true);
                }}
              >
                <FaEdit className="me-2"/> Edit Listing
              </Button>
              
              {selectedListing.status === 'AVAILABLE' && (
                <Button 
                  variant="outline-danger" 
                  className="rounded-pill px-4"
                  onClick={() => handleDeleteListing(selectedListing.id)}
                >
                  <FaTrash className="me-2"/> Delete
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleUpdateListing}>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Edit Food</Modal.Title></Modal.Header>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Food Name</Form.Label>
              <Form.Control name="name" required value={editFormData.name || ''} onChange={handleEditChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Servings (Minimum 1)</Form.Label>
              <Form.Control 
                name="servings" 
                type="number" 
                min="1" 
                required 
                value={editFormData.servings || ''} 
                onChange={handleEditChange} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Type</Form.Label>
              <Form.Select name="type" value={editFormData.type || ''} onChange={handleEditChange}>
                <option value="VEG">Vegetarian</option>
                <option value="NON_VEG">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={editFormData.description || ''} onChange={handleEditChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MyDonations;