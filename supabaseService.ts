import { supabase } from './supabaseClient';
import { Task, Department, EventType } from './types';

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
  }
};