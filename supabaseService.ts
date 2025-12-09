import { supabase } from './supabaseClient';
import { Task, Department, EventType, Template, TagItem, EventTypeItem } from './types';

export const SupabaseService = {
  // 1. 讀取任務 (只抓這個人的)
  fetchTasks: async (userName: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_name', userName)
      .order('date', { ascending: false }); // 越新的放越上面

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    // 轉換資料庫欄位 -> 前端格式
    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      department: row.department as Department,
      eventType: row.event_type as EventType, // 轉回來
      product: row.product || '',
      description: row.description,
      hours: row.hours,
      timestamp: new Date(row.created_at).getTime()
    }));
  },

  // 2. 新增任務
  addTask: async (task: Task, userName: string) => {
    const { data, error } = await supabase
      .from('work_logs')
      .insert([
        {
          date: task.date,
          department: task.department,
          event_type: task.eventType, // 轉過去
          product: task.product || null,
          description: task.description,
          hours: task.hours,
          user_name: userName
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }
    return data; // 回傳新增成功的那一筆 (包含 DB 產生的 ID)
  },

  // 3. 更新任務
  updateTask: async (task: Task) => {
    const { error } = await supabase
      .from('work_logs')
      .update({
        date: task.date,
        department: task.department,
        event_type: task.eventType,
        product: task.product || null,
        description: task.description,
        hours: task.hours
      })
      .eq('id', task.id);

    if (error) console.error('Error updating task:', error);
  },

  // 4. 刪除任務
  deleteTask: async (id: string) => {
    const { error } = await supabase
      .from('work_logs')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting task:', error);
  },
   // --- TEMPLATES ---
  fetchTemplates: async (userName: string): Promise<Template[]> => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_name', userName)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      label: row.label,
      department: row.department,
      eventType: row.event_type,
      defaultProduct: row.default_product || '',
      defaultDescription: row.default_description || '',
      defaultHours: row.default_hours,
      icon: row.icon || 'Star'
    }));
  },

  addTemplate: async (template: Omit<Template, 'id'>, userName: string) => {
    const { data, error } = await supabase
      .from('templates')
      .insert([{
        user_name: userName,
        label: template.label,
        department: template.department,
        event_type: template.eventType,
        default_product: template.defaultProduct || null,
        default_description: template.defaultDescription,
        default_hours: template.defaultHours,
        icon: template.icon
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding template:', error);
      return null;
    }
    return {
        id: data.id,
        label: data.label,
        department: data.department,
        eventType: data.event_type,
        defaultProduct: data.default_product,
        defaultDescription: data.default_description,
        defaultHours: data.default_hours,
        icon: data.icon
    };
  },

  deleteTemplate: async (id: string) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) console.error('Error deleting template:', error);
  },

  // --- TAGS (Settings) ---
  fetchTags: async (userName: string): Promise<TagItem[]> => {
    // 這裡我們做一個特殊的邏輯：讀取 "default" (系統預設) + "userName" (個人自訂) 的標籤
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .or(`user_name.eq.${userName},user_name.eq.default`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      category: row.category,
      label: row.label,
      color: row.color
    }));
  },

  addTag: async (tag: Omit<TagItem, 'id'>, userName: string) => {
    const { data, error } = await supabase
      .from('tags')
      .insert([{
        user_name: userName,
        category: tag.category,
        label: tag.label,
        color: tag.color
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding tag:', error);
      return null;
    }
    return {
      id: data.id,
      category: data.category,
      label: data.label,
      color: data.color
    };
  },

  deleteTag: async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) console.error('Error deleting tag:', error);
  },

// --- Event Types ---
  // 1. 修改 fetch：接收 userName 參數，只撈該使用者的設定
  fetchEventTypes: async (userName: string): Promise<EventTypeItem[]> => {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('user_name', userName) // 關鍵修改：只抓目前使用者的
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching event types:', error);
      return [];
    }
    return data;
  },

  // 2. 修改 add：接收 userName 參數，寫入資料庫時標記是誰新增的
  addEventType: async (name: string, userName: string): Promise<EventTypeItem | null> => {
    const { data, error } = await supabase
      .from('event_types')
      .insert([{ 
        name, 
        user_name: userName // 關鍵修改：寫入使用者名稱
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding event type:', error);
      return null;
    }
    return data;
  },

  // delete 維持原樣即可，因為 ID 是唯一的
  deleteEventType: async (id: string) => {
    const { error } = await supabase.from('event_types').delete().eq('id', id);
    if (error) console.error('Error deleting event type:', error);
  }
};