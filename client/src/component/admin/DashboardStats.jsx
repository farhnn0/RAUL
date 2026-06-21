import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DashboardStats = ({ stats }) => {
    return (
        <Row className="g-4 mb-5">
            <Col md={6}>
                <div className="stats-card">
                    <h4>Total Pengguna</h4>
                    <div className="stats-number">{stats.totalUsers || 0}</div>
                </div>
            </Col>
            <Col md={6}>
                <div className="stats-card">
                    <h4>Total Review</h4>
                    <div className="stats-number">{stats.totalReviews || 0}</div>
                </div>
            </Col>
        </Row>
    );
};

export default DashboardStats;