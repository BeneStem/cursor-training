import { supabase } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
  user_id: string;
  ai_response?: string;
}

export async function getTickets(): Promise<Ticket[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return data || [];
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }

  return data;
}

export async function createTicket(title: string, description: string): Promise<Ticket> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a ticket');
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title,
      description,
      status: 'open',
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }

  // Simulate AI response generation (in production, this would call OpenAI)
  setTimeout(async () => {
    const aiResponse = generateMockAIResponse(title, description);
    await updateTicket(data.id, {
      ai_response: aiResponse,
      status: 'pending',
    });
  }, 2000);

  return data;
}

export async function updateTicket(
  id: string,
  updates: Partial<Pick<Ticket, 'status' | 'ai_response'>>
): Promise<Ticket> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a ticket');
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }

  return data;
}

function generateMockAIResponse(title: string, _description: string): string {
  // Mock AI response generation using OpenAI function calling pattern
  const responses = [
    `Thank you for reaching out regarding "${title}". Based on your description, I've analyzed the issue and here are my recommendations:\n\n1. First, please verify your account settings are up to date.\n2. Try clearing your browser cache and cookies.\n3. If the issue persists, please check if you're using the latest version of our application.\n\nI've also created a detailed troubleshooting guide for your specific case. Our team will review this within 24 hours. Is there anything else I can help clarify?`,
    
    `I understand you're experiencing issues with "${title}". Let me help you resolve this:\n\n**Immediate Steps:**\n- Log out and log back in to refresh your session\n- Ensure your internet connection is stable\n- Try accessing from a different browser\n\n**Next Steps:**\nI've escalated this to our technical team for investigation. You should receive an update within 2-4 business hours. We apologize for any inconvenience.`,
    
    `Thank you for contacting SupportFlow about "${title}". I've reviewed your query and here's what I found:\n\nThis appears to be a common issue that can typically be resolved by:\n1. Updating your profile settings\n2. Verifying your email address\n3. Restarting the application\n\nI've also sent you a detailed email with step-by-step instructions. Please let me know if you need any clarification or if the issue continues.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export function subscribeToTickets(
  userId: string,
  callback: (ticket: Ticket) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`tickets:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as Ticket);
        }
      }
    )
    .subscribe();

  return channel;
}

