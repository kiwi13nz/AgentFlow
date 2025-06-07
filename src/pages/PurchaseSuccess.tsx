// src/pages/PurchaseSuccess.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader, XCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { gumroadService } from '../lib/gumroadService';

export function PurchaseSuccess() {
  const { navigate, user, isAuthenticated } = useApp();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [credits, setCredits] = useState<number>(0);
  const [agentName, setAgentName] = useState<string>('');

  useEffect(() => {
    const handlePurchase = async () => {
      try {
        if (!isAuthenticated || !user) {
          setStatus('error');
          return;
        }

        // Handle purchase success using localStorage method
        const success = await gumroadService.handlePurchaseSuccess();
        
        if (success) {
          setStatus('success');
          
          // Get purchase details from localStorage before it's cleared
          const purchaseIntentStr = localStorage.getItem('gumroad_purchase_intent');
          if (purchaseIntentStr) {
            const intent = JSON.parse(purchaseIntentStr);
            setCredits(intent.credits);
            setAgentName(intent.agentName);
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Purchase processing error:', error);
        setStatus('error');
      }
    };

    // Delay to show processing state
    const timer = setTimeout(handlePurchase, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to complete your purchase.</p>
          <button
            onClick={() => navigate('landing')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Purchase</h2>
            <p className="text-gray-600">
              Please wait while we confirm your purchase and add credits to your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase Successful!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-green-800">
                <p className="font-semibold">Credits Added Successfully</p>
                <p className="text-sm mt-1">
                  {credits} credits have been added to your account
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              You can now use {agentName} with your purchased credits.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('marketplace')}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Use Your Credits</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('dashboard')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an issue processing your purchase. Please try again or contact support.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('marketplace')}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('dashboard')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}