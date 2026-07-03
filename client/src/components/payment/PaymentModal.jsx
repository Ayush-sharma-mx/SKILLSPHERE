import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, verifyPayment } from '../../features/payment/paymentSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/helpers';
import { CurrencyRupeeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, project, milestoneIndex, milestone, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading, currentOrder } = useSelector((s) => s.payment);
  const { user } = useSelector((s) => s.auth);
  const [step, setStep] = useState('confirm'); // confirm | processing | success

  const handlePay = async () => {
    try {
      const order = await dispatch(createOrder({
        projectId: project._id,
        milestoneIndex,
        amount: milestone.amount,
      })).unwrap();

      const razorpayOrder = order.razorpayOrder;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SkillSphere',
        description: `Payment for: ${milestone.title}`,
        order_id: razorpayOrder.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#3b82f6' },
        handler: async (response) => {
          setStep('processing');
          try {
            await dispatch(verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentId: order._id,
            })).unwrap();
            setStep('success');
            toast.success('Payment successful! Held in escrow.');
            if (onSuccess) onSuccess();
          } catch (err) {
            toast.error('Payment verification failed');
            setStep('confirm');
          }
        },
        modal: { ondismiss: () => setStep('confirm') },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err || 'Failed to initiate payment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Milestone Payment" size="sm">
      {step === 'success' ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-bold text-white text-lg">Payment Successful!</h3>
          <p className="text-gray-400 text-sm mt-2">Payment is held securely in escrow until you release it after milestone completion.</p>
          <Button className="mt-4 w-full" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Milestone Info */}
          <div className="p-4 bg-gray-800/60 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400">Milestone</p>
            <p className="font-semibold text-white mt-1">{milestone?.title}</p>
            <div className="flex items-center gap-1 mt-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{formatCurrency(milestone?.amount)}</span>
            </div>
          </div>

          {/* Escrow Notice */}
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <ShieldCheckIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300">Escrow Protection</p>
              <p className="text-xs text-blue-400/70 mt-0.5">Payment is held securely until you manually release it after reviewing the work.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 justify-center">
            <LockClosedIcon className="w-3.5 h-3.5" />
            <span>Secured by Razorpay</span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handlePay} isLoading={isLoading}>
              Pay {formatCurrency(milestone?.amount)}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
