import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../api/api';
import type { Profile } from '../types';
import { FaUserCircle, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Container className="py-5 fade-in">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-success py-5 text-center text-white">
              <FaUserCircle size={80} className="mb-3" />
              <h3 className="fw-bold mb-0">{profile?.name || 'User Profile'}</h3>
              <p className="opacity-75">{user?.role}</p>
            </div>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold"><FaIdCard className="me-2" />Full Name</Form.Label>
                  <Form.Control 
                    value={profile?.name || ''} 
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold"><FaEnvelope className="me-2" />Email Address</Form.Label>
                  <Form.Control value={user?.email || ''} disabled className="bg-light" />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small fw-bold"><FaPhone className="me-2" />Phone Number</Form.Label>
                  <Form.Control 
                    value={profile?.phoneNumber || ''} 
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <div className="text-center text-muted small">
                  To update your profile details, please contact support.
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
