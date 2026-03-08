import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleCityVisibility } from '@/app/actions/cities';
import { toggleWorkspaceVisibility } from '@/app/actions/workspaces';

// Mock 설정
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

describe('Admin Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleCityVisibility', () => {
    it('성공: 관리자가 도시를 숨김 처리하면 DB 업데이트 및 캐시 무효화', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleCityVisibility('city-123', true);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('cities');
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/cities');
    });

    it('성공: 관리자가 도시를 표시 처리하면 DB 업데이트 및 캐시 무효화', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleCityVisibility('city-123', false);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('cities');
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/cities');
    });

    it('권한 없음: requireAdmin 에러 발생 시 실패 응답 반환', async () => {
      // Arrange
      (requireAdmin as any).mockRejectedValue(new Error('관리자 권한이 필요합니다.'));

      // Act
      const result = await toggleCityVisibility('city-123', true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('관리자 권한이 필요합니다.');
    });

    it('DB 오류: Supabase update 실패 시 에러 처리', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Database connection failed' },
          }),
        })),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleCityVisibility('city-123', true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });
  });

  describe('toggleWorkspaceVisibility', () => {
    it('성공: 관리자가 작업공간을 숨김 처리하면 DB 업데이트 및 캐시 무효화', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'workspaces') {
            const chainMethods = {
              select: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              eq: vi.fn((column: string, value: string) => {
                // select().eq().single() 체인
                if (column === 'id' && chainMethods.select.mock.calls.length > 0) {
                  return {
                    single: vi.fn().mockResolvedValue({
                      data: { city_id: 'city-123' },
                      error: null,
                    }),
                  };
                }
                // update().eq() 체인
                return Promise.resolve({ error: null });
              }),
            };
            return chainMethods;
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleWorkspaceVisibility('workspace-456', true);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/workspaces');
      expect(revalidatePath).toHaveBeenCalledWith('/city/city-123');
    });

    it('성공: 관리자가 작업공간을 표시 처리하면 DB 업데이트 및 캐시 무효화', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'workspaces') {
            const chainMethods = {
              select: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              eq: vi.fn((column: string, value: string) => {
                if (column === 'id' && chainMethods.select.mock.calls.length > 0) {
                  return {
                    single: vi.fn().mockResolvedValue({
                      data: { city_id: 'city-789' },
                      error: null,
                    }),
                  };
                }
                return Promise.resolve({ error: null });
              }),
            };
            return chainMethods;
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleWorkspaceVisibility('workspace-456', false);

      // Assert
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/workspaces');
      expect(revalidatePath).toHaveBeenCalledWith('/city/city-789');
    });

    it('권한 없음: requireAdmin 에러 발생 시 실패 응답 반환', async () => {
      // Arrange
      (requireAdmin as any).mockRejectedValue(new Error('관리자 권한이 필요합니다.'));

      // Act
      const result = await toggleWorkspaceVisibility('workspace-456', true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('관리자 권한이 필요합니다.');
    });

    it('작업공간 없음: city_id 조회 실패 시 에러 처리', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Workspace not found' },
          }),
        })),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleWorkspaceVisibility('workspace-456', true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('작업공간을 찾을 수 없습니다.');
    });

    it('DB 오류: Supabase update 실패 시 에러 처리', async () => {
      // Arrange
      (requireAdmin as any).mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'workspaces') {
            const chainMethods = {
              select: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              eq: vi.fn((column: string, value: string) => {
                // select().eq().single() - 성공
                if (column === 'id' && chainMethods.select.mock.calls.length > 0) {
                  return {
                    single: vi.fn().mockResolvedValue({
                      data: { city_id: 'city-123' },
                      error: null,
                    }),
                  };
                }
                // update().eq() - 실패
                return Promise.resolve({
                  error: { message: 'Update failed' },
                });
              }),
            };
            return chainMethods;
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      // Act
      const result = await toggleWorkspaceVisibility('workspace-456', true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Update failed');
    });
  });
});
