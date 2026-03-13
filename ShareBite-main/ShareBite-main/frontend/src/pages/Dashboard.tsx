import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUtensils, FaHandsHelping, FaList, FaHistory, FaBell } from 'react-icons/fa';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [newFoodAlert, setNewFoodAlert] = useState<{ name: string; address: string } | null>(null);

  useEffect(() => {
    let stompClient: Stomp.Client | null = null;

    try {
      const socket = new SockJS('http://localhost:8080/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {}; // Hide console logs

      stompClient.connect({}, 
        () => {
          // Success callback
          stompClient?.subscribe('/topic/new-food', (message) => {
            const foodData = JSON.parse(message.body);
            if (user?.role === 'RECIPIENT' && foodData.donorId !== user.id) {
              setNewFoodAlert({
                name: foodData.name,
                address: foodData.address
              });
              setShowNotification(true);
            }
          });
        }, 
        (error) => {
          // Error callback - prevents the app from crashing if backend is down
          console.error('WebSocket Error:', error);
        }
      );
    } catch (err) {
      console.error('Connection failed', err);
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, [user]);

  return (
    <Container className="py-5 fade-in">
      <div className="mb-5">
        <h1 className="fw-bold text-success">Welcome, {user?.name}!</h1>
        <p className="text-muted lead">What would you like to do today?</p>
      </div>

      <Row className="g-4">
        {user?.role === 'DONOR' ? (
          <>
            <Col md={6}>
              <Link to="/create-listing" className="text-decoration-none">
                <Card className="h-100 p-4 text-center shadow-sm hover-shadow border-0">
                  <Card.Body>
                    <div className="mb-3 text-success"><FaUtensils size={50} /></div>
                    <Card.Title className="fw-bold fs-3 text-dark">Donate Food</Card.Title>
                    <Card.Text className="text-muted">List your surplus food to help those in need.</Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={6}>
              <Link to="/my-donations" className="text-decoration-none">
                <Card className="h-100 p-4 text-center shadow-sm hover-shadow border-0">
                  <Card.Body>
                    <div className="mb-3 text-primary"><FaList size={50} /></div>
                    <Card.Title className="fw-bold fs-3 text-dark">My Donations</Card.Title>
                    <Card.Text className="text-muted">View and manage your active and past food listings.</Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </>
        ) : (
          <>
            <Col md={6}>
              <Link to="/available" className="text-decoration-none">
                <Card className="h-100 p-4 text-center shadow-sm hover-shadow border-0">
                  <Card.Body>
                    <div className="mb-3 text-success"><FaHandsHelping size={50} /></div>
                    <Card.Title className="fw-bold fs-3 text-dark">Browse Food</Card.Title>
                    <Card.Text className="text-muted">See what's available near you and claim food today.</Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={6}>
              <Link to="/my-claims" className="text-decoration-none">
                <Card className="h-100 p-4 text-center shadow-sm hover-shadow border-0">
                  <Card.Body>
                    <div className="mb-3 text-primary"><FaHistory size={50} /></div>
                    <Card.Title className="fw-bold fs-3 text-dark">My Claims</Card.Title>
                    <Card.Text className="text-muted">Track your active claims and view your history.</Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </>
        )}
      </Row>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast onClose={() => setShowNotification(false)} show={showNotification} delay={8000} autohide className="shadow-lg border-0">
          <Toast.Header className="bg-success text-white border-0">
            <FaBell className="me-2" />
            <strong className="me-auto">New Food Nearby!</strong>
          </Toast.Header>
          <Toast.Body className="bg-white p-3">
            <p className="mb-1"><strong>{newFoodAlert?.name}</strong> is now available.</p>
            <p className="text-muted small mb-2">{newFoodAlert?.address}</p>
            <Link to="/available" className="btn btn-sm btn-outline-success w-100 rounded-pill" onClick={() => setShowNotification(false)}>View Listing</Link>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Dashboard;