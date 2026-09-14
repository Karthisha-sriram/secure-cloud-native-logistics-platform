# Secure Cloud-Native Logistics Management Platform

A full-stack logistics management platform designed for shipment tracking, freight operations, customer management, document compliance, analytics, security monitoring, and AI-assisted logistics operations.

## Overview

The Secure Cloud-Native Logistics Management Platform provides an end-to-end system for managing logistics operations through a React frontend and Node.js REST API backend.

The platform includes shipment lifecycle management, customer and document management, operational analytics, JWT-based authentication, role-based access control, security monitoring, notifications, and a Gemini-powered logistics assistant.

## Key Features

### Shipment Management

* Create, update, and manage shipments
* Shipment lifecycle tracking
* Shipment status and priority management
* Tracking information and delivery milestones
* Search, filtering, sorting, and pagination

### Customer Management

* Customer directory
* Customer profiles
* Customer shipment history
* Customer-specific operational information

### Document Management

* Document metadata management
* Logistics document classification
* Support for Bills of Lading, Customs Declarations, Commercial Invoices, and Proof of Delivery
* Configurable document storage architecture

### Analytics and Dashboard

* Shipment and fleet KPIs
* Delivery performance metrics
* Shipment status distribution
* Transit and delay analytics
* Regional logistics throughput metrics

### Authentication and Security

* JWT-based authentication
* Role-Based Access Control (RBAC)
* ADMIN, OPERATIONS_MANAGER, and CUSTOMER roles
* Protected REST API endpoints
* Session management
* Security event monitoring
* Authentication and security activity tracking

### AI Logistics Assistant

* Server-side Google Gemini integration
* Logistics-focused conversational assistant
* Shipment and operational context
* AI-assisted logistics queries
* Multi-model fallback for improved reliability
* Local fallback handling when external AI services are unavailable

### Notifications

* Operational notification management
* Read and unread notification states
* Notification interface integrated with the application

### Profile and Settings

* User profile management
* Account settings
* Security and session information

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Recharts

### Backend

* Node.js
* TypeScript
* REST APIs
* JWT Authentication
* Role-Based Access Control

### AI

* Google Gemini API

### Database and Storage

* SQL/database integration
* Document storage abstraction
* Local and cloud-storage compatible architecture

### Development and CI/CD

* Git
* GitHub
* GitHub Actions
* Cloud-oriented configuration

## Architecture

```text
React + TypeScript
        |
        | REST API
        v
Node.js + TypeScript Backend
        |
        +-- Authentication and RBAC
        +-- Shipment Management
        +-- Customer Management
        +-- Document Management
        +-- Notifications
        +-- Analytics
        +-- Security Monitoring
        |
        +-- Gemini AI Assistant
```

## API Modules

The backend provides REST APIs for the major application modules:

```text
/api/auth
/api/shipments
/api/customers
/api/documents
/api/notifications
/api/analytics
/api/profile
/api/security
/api/ai
```

## Security

The application uses JWT-based authentication and backend-enforced role-based access control to protect API resources.

Sensitive configuration such as API credentials, authentication secrets, and database credentials should be provided through environment variables and should not be committed to source control.

## Running Locally

### Prerequisites

* Node.js 20+
* npm

### Installation

```bash
git clone <repository-url>
cd secure-cloud-native-logistics-platform
npm install
```

### Environment Configuration

Create a `.env` file using the provided environment configuration as a reference.

Do not commit API keys, passwords, tokens, or other sensitive credentials to the repository.

### Start the Application

```bash
npm run dev
```

The application will start using the configured development server.

## Project Structure

```text
.
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── App.tsx
│
├── server/
│   ├── routes/
│   ├── ai.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   └── types.ts
│
├── server.ts
├── package.json
├── vite.config.ts
└── README.md
```

## Project Status

The current version is a working full-stack logistics management application with a React and TypeScript frontend and a Node.js and TypeScript backend.

The project is designed with a modular architecture to support future cloud deployment and backend evolution.

## Purpose

This project demonstrates practical experience in:

* Full-stack web development
* REST API development
* Authentication and authorization
* Role-based access control
* Backend security
* Database integration
* Cloud-oriented application architecture
* AI integration
* Analytics and operational dashboards
* CI/CD practices

## Disclaimer

This project is developed as a software engineering portfolio project demonstrating full-stack development, REST API design, authentication, security, cloud-oriented architecture, analytics, and AI integration.
