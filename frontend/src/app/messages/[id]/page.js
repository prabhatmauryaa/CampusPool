'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWindow from '@/components/chat/ChatWindow';

export default function SingleMessagePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col">
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] h-[78vh]">
          <ChatWindow
            conversationId={conversationId}
            onBack={() => router.push('/messages')}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
