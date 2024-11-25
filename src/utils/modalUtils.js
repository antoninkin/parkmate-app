import React from 'react';
import { createRoot } from 'react-dom/client';
import BookingModal from '../component/BookingModal';

export const openBookingModal = (locationTitle) => {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'booking-modal-container';
    document.body.appendChild(modalContainer);

    const root = createRoot(modalContainer);

    root.render(
        <BookingModal
            locationTitle={locationTitle}
            onClose={() => {
                root.unmount();
                document.body.removeChild(modalContainer);
            }}
        />
    );
};