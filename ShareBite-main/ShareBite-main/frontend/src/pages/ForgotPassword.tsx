import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaLock, FaEnvelope } from 'react-icons/fa';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('A verification code has been sent to your email.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please check your email.');
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
              <h2 className="text-center mb-4 fw-bold text-success">Forgot Password</h2>
              <p className="text-center text-muted mb-4">Enter your email to receive a reset code</p>
              
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label><FaEnvelope className="me-2 text-muted" />Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
