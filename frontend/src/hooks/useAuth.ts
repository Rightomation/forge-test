import { useAuthStore } from "@/store/authStore";
import { LoginCredentials, RegisterCredentials } from "@/types";
import { generateId } from "@/lib/utils";
import toast from "react-hot-toast";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading } =
    useAuthStore();

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock validation
      if (credentials.password.length < 6) {
        toast.error("Invalid email or password");
        return false;
      }

      const mockUser = {
        id: generateId(),
        name: credentials.email.split("@")[0].replace(/[._]/g, " "),
        email: credentials.email,
        avatar: undefined,
      };
      const mockToken = `mock_jwt_${generateId()}`;

      login(mockUser, mockToken);
      toast.success(`Welcome back, ${mockUser.name}!`);
      return true;
    } catch {
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: generateId(),
        name: credentials.name,
        email: credentials.email,
        avatar: undefined,
      };
      const mockToken = `mock_jwt_${generateId()}`;

      login(mockUser, mockToken);
      toast.success(`Welcome to TodoApp, ${credentials.name}!`);
      return true;
    } catch {
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
