import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="p-4 fade-in">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold text-success">Welcome Back</h2>
              <p className="text-center text-muted mb-4">Login to continue sharing bites</p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label><FaEnvelope className="me-2 text-muted" />Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label><FaLock className="me-2 text-muted" />Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2 mb-3" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                
                <div className="text-center">
                  <Link to="/forgot-password" size="sm" className="text-decoration-none text-muted">
                    Forgot Password?
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
          <div className="text-center mt-4">
            Don't have an account? <Link to="/register" className="text-success fw-bold text-decoration-none">Register here</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
