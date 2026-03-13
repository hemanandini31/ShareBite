import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { FaHandsHelping, FaLeaf, FaUserFriends, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="bg-white py-5 mb-5 border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold text-success mb-3">
                Reduce Food Waste, <br /> Share a Bite.
              </h1>
              <p className="lead text-muted mb-4">
                Connecting surplus food from donors to those who need it most. 
                A simple platform to build a stronger, hunger-free community.
              </p>
              <div className="d-flex justify-content-center justify-content-lg-start gap-3">
                {!isAuthenticated ? (
                  <Button as={Link} to="/register" variant="success" size="lg" className="px-5">
                    Get Started
                  </Button>
                ) : (
                  <Button as={Link} to="/dashboard" variant="success" size="lg" className="px-5">
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Food Sharing" 
                className="img-fluid rounded-circle shadow-lg"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-5">How it Works</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 p-4 text-center">
              <div className="mb-3 text-success">
                <FaLeaf size={40} />
              </div>
              <Card.Title className="fw-bold">Reduce Waste</Card.Title>
              <Card.Text className="text-muted">
                Donors list surplus food that would otherwise go to waste. Fresh, safe, and ready to share.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 p-4 text-center">
              <div className="mb-3 text-success">
                <FaHandsHelping size={40} />
              </div>
              <Card.Title className="fw-bold">Easy Claiming</Card.Title>
              <Card.Text className="text-muted">
                Recipients browse available listings nearby and claim what they need with a single click.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 p-4 text-center">
              <div className="mb-3 text-success">
                <FaUserFriends size={40} />
              </div>
              <Card.Title className="fw-bold">Community Driven</Card.Title>
              <Card.Text className="text-muted">
                Built on trust and verification. We help neighbors support neighbors through food.
              </Card.Text>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <div className="bg-success text-white py-5 mt-5">
        <Container className="text-center">
          <h2 className="fw-bold mb-4">Ready to join the movement?</h2>
          <Button as={Link} to="/register" variant="light" size="lg" className="text-success fw-bold px-5">
            Register Now <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </div>
    </div>
  );
};

export default Landing;
