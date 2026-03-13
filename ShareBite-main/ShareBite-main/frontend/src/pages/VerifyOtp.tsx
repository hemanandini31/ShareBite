import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaShieldAlt } from 'react-icons/fa';

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email not found. Please register again.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post('/auth/send-otp', { email });
      setSuccess('New OTP sent to your email.');
    } catch (err: any) {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 fade-in text-center">
            <Card.Body>
              <div className="mb-4">
                <FaShieldAlt size={50} className="text-success" />
              </div>
              <h2 className="fw-bold text-success mb-3">Verify Email</h2>
              <p className="text-muted mb-4">
                We've sent a 6-digit code to <br /> <strong>{email || 'your email'}</strong>
              </p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Control 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    className="text-center fw-bold fs-4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2 mb-3" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Now'}
                </Button>
                
                <Button variant="link" className="text-decoration-none text-success p-0" onClick={resendOtp}>
                  Didn't receive code? Resend
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyOtp;
