import React from 'react';
import { createRoot } from 'react-dom/client';
import BookingModal from '../component/BookingModal';

export const openBookingModal = (locationTitle) => {
    if (document.getElementById('booking-modal-container')) return;

    const modalContainer = document.createElement('div');
    modalContainer.id = 'booking-modal-container';
    document.body.appendChild(modalContainer);

    const root = createRoot(modalContainer);

    const close = () => {
        root.unmount();
        if (document.body.contains(modalContainer)) {
            document.body.removeChild(modalContainer);
        }
    };

    root.render(
        <BookingModal
            locationTitle={locationTitle}
            onClose={close}
        />
    );
};
