import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { CompareProvider } from '../context/CompareContext';
import Compare from '../pages/Compare';

vi.mock('../services/api', () => ({
  compareVehicles: vi.fn(() =>
    Promise.resolve({
      data: [
        { _id: '1', make: 'Toyota', model: 'Corolla', year: 2020, price_pkr: 3500000, body_type: 'Sedan', features: ['ABS', 'Airbags'] },
        { _id: '2', make: 'Honda', model: 'Civic', year: 2019, price_pkr: 4000000, body_type: 'Sedan', features: ['ABS'] },
      ],
    })
  ),
}));

describe('Compare', () => {
  it('shows empty state when no vehicles added', () => {
    render(
      <MemoryRouter>
        <CompareProvider>
          <Compare />
        </CompareProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Add up to 3 vehicles/)).toBeInTheDocument();
  });
});
