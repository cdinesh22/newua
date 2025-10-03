import { supabase } from '../lib/supabaseClient';

class ApiClient {
  constructor() {
    this.supabase = supabase;
  }

  // Helper method to get current user
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Helper method to get session
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // Auth methods
  async login(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get user profile
    const { data: profile } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return {
      user: {
        ...data.user,
        ...profile
      },
      session: data.session
    };
  }

  async register(userData) {
    const { email, password, name, phone, role = 'pilgrim' } = userData;
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role }
      }
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session
    };
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // Temple methods
  async getTemples(params = {}) {
    const { page = 1, limit = 10, search, city, state } = params;
    
    let query = this.supabase
      .from('temples')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (state) {
      query = query.eq('state', state);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      temples: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async getTemple(id) {
    const { data, error } = await this.supabase
      .from('temples')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Slot methods
  async getSlots(templeId, date) {
    let query = this.supabase
      .from('slots')
      .select('*')
      .eq('temple_id', templeId)
      .eq('is_available', true);

    if (date) {
      query = query.eq('date', date);
    } else {
      query = query.gte('date', new Date().toISOString().split('T')[0]);
    }

    query = query.order('date').order('start_time');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Booking methods
  async getBookings(params = {}) {
    const { page = 1, limit = 10, status, temple_id } = params;
    const user = await this.getCurrentUser();
    
    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        temple:temples(name, city, state),
        slot:slots(date, start_time, end_time)
      `)
      .eq('user_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }
    if (temple_id) {
      query = query.eq('temple_id', temple_id);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      bookings: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async getBooking(id) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        temple:temples(name, city, state, address, description),
        slot:slots(date, start_time, end_time)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createBooking(bookingData) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id
      })
      .select(`
        *,
        temple:temples(name, city, state),
        slot:slots(date, start_time, end_time)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBooking(id, updates) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        temple:temples(name, city, state),
        slot:slots(date, start_time, end_time)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async cancelBooking(id) {
    return this.updateBooking(id, { status: 'cancelled' });
  }

  // User profile methods
  async getUserProfile() {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        bookings:bookings(
          id,
          booking_id,
          status,
          visitors_count,
          total_amount,
          created_at,
          temple:temples(name),
          slot:slots(date, start_time, end_time)
        )
      `)
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserProfile(updates) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Contact methods
  async submitContactMessage(messageData) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Community methods
  async getCommunityPosts(params = {}) {
    const { page = 1, limit = 10, temple_id } = params;
    
    let query = this.supabase
      .from('community_posts')
      .select(`
        *,
        user:users(name),
        temple:temples(name),
        comments:community_comments(
          id,
          content,
          created_at,
          user:users(name)
        ),
        likes:community_likes(count)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (temple_id) {
      query = query.eq('temple_id', temple_id);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      posts: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async createCommunityPost(postData) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('community_posts')
      .insert({
        ...postData,
        user_id: user.id
      })
      .select(`
        *,
        user:users(name),
        temple:temples(name)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async likePost(postId) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('community_likes')
      .insert({
        post_id: postId,
        user_id: user.id
      });
    
    if (error) throw error;
    return data;
  }

  async unlikePost(postId) {
    const user = await this.getCurrentUser();
    
    const { error } = await this.supabase
      .from('community_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  }

  async addComment(postId, content) {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        user:users(name)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }
}

const api = new ApiClient();
export default api;
