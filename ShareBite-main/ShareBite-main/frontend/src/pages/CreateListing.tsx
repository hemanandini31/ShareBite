import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/api';
import { FaUtensils, FaImage, FaMapMarkerAlt, FaUsers, FaClock, FaPhone, FaLocationArrow } from 'react-icons/fa';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CreateListing: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servings: 1,
    type: 'Vegetarian',
    photoUrl: '', // This will now hold the Base64 string
    latitude: 0,
    longitude: 0,
    address: '',
    phoneNumber: '',
    claimByTime: ''
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'servings' ? parseFloat(value) : value 
    });
  };

  // --- NEW: Handle File Upload and Base64 Conversion ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local URL for immediate UI preview
      setPhotoPreview(URL.createObjectURL(file));

      // Convert file to Base64 string for Database storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, photoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Geolocation Logic ---
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setAccuracy(acc);
        if (acc < 20) stopLocating(watchId);
      },
      (err) => {
        stopLocating(watchId);
        alert("Unable to get high-accuracy location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    setTimeout(() => stopLocating(watchId), 5000);
  };

  const stopLocating = (id: number) => {
    navigator.geolocation.clearWatch(id);
    setLocating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.latitude === 0 || formData.longitude === 0) {
        alert("Please pin a location on the map.");
        setLoading(false);
        return;
      }

      if (!formData.photoUrl) {
        alert("Please upload a photo of the food.");
        setLoading(false);
        return;
      }

      const submissionData = {
        ...formData,
        servings: Number(formData.servings),
        claimByTime: new Date(formData.claimByTime).toISOString(),
        phoneNumber: formData.phoneNumber.replace(/[^0-9+]/g, '')
      };

      await api.post('/listings/create', submissionData);
      alert('Listing created successfully!');
      navigate('/my-donations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing. Check image size.');
    } finally {
      setLoading(false);
    }
  };

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
        setAccuracy(null);
      },
    });

    useEffect(() => {
      if (formData.latitude !== 0 && formData.longitude !== 0) {
        map.flyTo([formData.latitude, formData.longitude], 16);
      }
    }, [formData.latitude, formData.longitude, map]);

    return formData.latitude === 0 ? null : (
      <>
        <Marker position={[formData.latitude, formData.longitude]}>
          <Popup>Pickup Point</Popup>
        </Marker>
        {accuracy && (
          <Circle 
            center={[formData.latitude, formData.longitude]} 
            radius={accuracy} 
            pathOptions={{ color: '#28a745', fillColor: '#28a745', fillOpacity: 0.2 }}
          />
        )}
      </>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="p-4 shadow-sm border-0 fade-in">
            <Card.Body>
              <h2 className="fw-bold text-success mb-4">Donate Food</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaUtensils className="me-2" />Food Name</Form.Label>
                      <Form.Control name="name" placeholder="e.g. Fresh Pasta Salad" onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Food Type</Form.Label>
                      <Form.Select name="type" onChange={handleChange}>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control name="description" as="textarea" rows={2} placeholder="Ingredients/allergens..." onChange={handleChange} required />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaUsers className="me-2" />Servings</Form.Label>
                      <Form.Control name="servings" type="number" min="1" step="0.5" value={formData.servings} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaClock className="me-2" />Claim By</Form.Label>
                      <Form.Control name="claimByTime" type="datetime-local" onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                {/* --- UPDATED: PHOTO UPLOAD SECTION --- */}
                <Form.Group className="mb-4">
                  <Form.Label><FaImage className="me-2" />Food Photo</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                  />
                  {photoPreview && (
                    <div className="mt-3 text-center">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="rounded shadow-sm border"
                        style={{ maxHeight: '200px', width: 'auto' }} 
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0 fw-bold"><FaMapMarkerAlt className="me-2" />Pickup Location</Form.Label>
                    <Button variant="outline-success" size="sm" type="button" onClick={handleLocateMe} disabled={locating}>
                      {locating ? <Spinner size="sm" /> : <><FaLocationArrow className="me-1" /> Find Me</>}
                    </Button>
                  </div>
                  <div className="border rounded overflow-hidden" style={{ height: '300px', width: '100%' }}>
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker />
                    </MapContainer>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Detailed Address</Form.Label>
                  <Form.Control name="address" placeholder="Apt, Street, Landmark" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label><FaPhone className="me-2" />Pickup Contact</Form.Label>
                  <Form.Control name="phoneNumber" placeholder="1234567890" onChange={handleChange} required />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="success" type="submit" className="px-5 py-2 fw-bold" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Donation'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(-1)} className="px-4">Cancel</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateListing;