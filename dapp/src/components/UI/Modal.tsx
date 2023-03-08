import React, { useEffect } from 'react';
import LayoutFlex from '../Layout/LayoutFlex';

type ModalProps = {
  isOpen: any;
  title: string;
  subtitle?: string;
  children: any;
  onCloseModal: Function;
};

const Modal = (props: ModalProps) => {
  const { isOpen, title, subtitle, children, onCloseModal } = props;

  useEffect(() => {
    const escClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseModal();
      }
    };
    window.addEventListener('keydown', escClose);
    return () => window.removeEventListener('keydown', escClose);
  });

  if (!isOpen) return null;

  return (
    <>
      <div className='modal__overlay' onClick={() => onCloseModal}></div>
      <div className='modal'>
        <div className='modal__header'>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className='modal__body'>{children}</div>
      </div>
    </>
  );
};

export default Modal;
