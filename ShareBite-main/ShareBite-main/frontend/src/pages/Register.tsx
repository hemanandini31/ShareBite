import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserTag } from 'react-icons/fa';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'RECIPIENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      // Redirect to OTP verification after registration
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 fade-in">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold text-success">Join ShareBite</h2>
              <p className="text-center text-muted mb-4">Start making a difference today</p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaUser className="me-2 text-muted" />Full Name</Form.Label>
                      <Form.Control 
                        name="name"
                        placeholder="John Doe" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaPhone className="me-2 text-muted" />Phone Number</Form.Label>
                      <Form.Control 
                        name="phoneNumber"
                        placeholder="1234567890" 
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label><FaEnvelope className="me-2 text-muted" />Email address</Form.Label>
                  <Form.Control 
                    name="email"
                    type="email" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><FaLock className="me-2 text-muted" />Password</Form.Label>
                  <Form.Control 
                    name="password"
                    type="password" 
                    placeholder="Create a strong password" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label><FaUserTag className="me-2 text-muted" />I want to...</Form.Label>
                  <Form.Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="RECIPIENT">Receive Food (Recipient)</option>
                    <option value="DONOR">Donate Food (Donor)</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2 mb-3" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register Now'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="text-center mt-4">
            Already have an account? <Link to="/login" className="text-success fw-bold text-decoration-none">Login here</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
