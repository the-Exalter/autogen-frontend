import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CompareProvider } from '../context/CompareContext';
import VehicleCard from '../components/VehicleCard';

const mockVehicle = {
  _id: '507f1f77bcf86cd799439011',
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  variant: 'GLi',
  body_type: 'Sedan',
  fuel_type: 'Petrol',
  transmission: 'Automatic',
  engine_capacity: '1600 cc',
  price_pkr: 3500000,
  mileage_km: 30000,
  province: 'Lahore',
  source: 'db',
  images: [],
};

const mockAIVehicle = { ...mockVehicle, _id: '507f1f77bcf86cd799439012', source: 'ai_generated' };

function Wrapper({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <CompareProvider>{children}</CompareProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('VehicleCard', () => {
  it('renders make, model, and year', () => {
    render(<Wrapper><VehicleCard vehicle={mockVehicle} /></Wrapper>);
    expect(screen.getByText(/Toyota/)).toBeInTheDocument();
    expect(screen.getByText(/Corolla/)).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<Wrapper><VehicleCard vehicle={mockVehicle} /></Wrapper>);
    expect(screen.getByText(/PKR 35\.0 Lacs/)).toBeInTheDocument();
  });

  it('shows AI badge for ai_generated vehicles', () => {
    render(<Wrapper><VehicleCard vehicle={mockAIVehicle} /></Wrapper>);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('does NOT show AI badge for db vehicles', () => {
    render(<Wrapper><VehicleCard vehicle={mockVehicle} /></Wrapper>);
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
  });

  it('shows province', () => {
    render(<Wrapper><VehicleCard vehicle={mockVehicle} /></Wrapper>);
    expect(screen.getByText('Lahore')).toBeInTheDocument();
  });

  it('renders compare button', () => {
    render(<Wrapper><VehicleCard vehicle={mockVehicle} /></Wrapper>);
    expect(screen.getByText('+ Compare')).toBeInTheDocument();
  });
});
