import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Heart, 
  Activity,
  Droplets,
  Shield
} from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Diabetes Monitoring
            </h1>
          </div>
          <p className="text-blue-100 text-lg max-w-md">
            ระบบติดตามสุขภาพผู้ป่วยเบาหวานอัจฉริยะ
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 text-white/90">
            <div className="p-2 bg-white/20 rounded-lg">
              <Droplets className="w-5 h-5" />
            </div>
            <span>ติดตามค่าน้ำตาลในเลือด</span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
            <span>ตรวจวัดความดันโลหิต</span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <span>เชื่อมต่อ LINE OA อัตโนมัติ</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-200 text-sm">
          © 2025 Diabetes Monitoring System
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Diabetes Monitoring
            </h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                เข้าสู่ระบบ
              </CardTitle>
              <CardDescription className="text-center">
                กรอกข้อมูลเพื่อเข้าใช้งานระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ลืมรหัสผ่าน?{' '}
                <span className="text-primary hover:underline cursor-pointer">
                  ติดต่อผู้ดูแลระบบ
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>ปลอดภัย</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>เชื่อถือได้</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
