import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaLock, FaKey } from 'react-icons/fa';

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Invalid OTP or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 fade-in">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold text-success">Reset Password</h2>
              <p className="text-center text-muted mb-4">Enter the code sent to {email}</p>
              
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label><FaKey className="me-2 text-muted" />Verification Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><FaLock className="me-2 text-muted" />New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label><FaLock className="me-2 text-muted" />Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2" disabled={loading}>
                  {loading ? 'Reseting...' : 'Reset Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
