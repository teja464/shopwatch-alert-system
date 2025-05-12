
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternateNumber: z.string().min(10, "Alternate number must be at least 10 digits").optional(),
  shopAddress: z.string().min(5, "Shop address must be at least 5 characters"),
  openingTime: z.string().min(1, "Please select opening time"),
  closingTime: z.string().min(1, "Please select closing time"),
});

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    alternateNumber: "",
    shopAddress: "",
    openingTime: "",
    closingTime: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      userSchema.parse(user);
      
      // Save user data to localStorage (in a real app, you would send this to a backend)
      localStorage.setItem("shopSecurityUser", JSON.stringify(user));
      
      toast({
        title: "Registration Successful",
        description: "Your details have been saved successfully.",
      });
      
      navigate("/permissions");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Register Your Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={user.firstName} 
                  onChange={handleChange}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={user.lastName} 
                  onChange={handleChange}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input 
                id="mobileNumber" 
                name="mobileNumber" 
                type="tel"
                value={user.mobileNumber} 
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
              {errors.mobileNumber && <p className="text-red-500 text-xs">{errors.mobileNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternateNumber">Alternate Number (Optional)</Label>
              <Input 
                id="alternateNumber" 
                name="alternateNumber" 
                type="tel"
                value={user.alternateNumber} 
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
              {errors.alternateNumber && <p className="text-red-500 text-xs">{errors.alternateNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopAddress">Shop Address</Label>
              <Input 
                id="shopAddress" 
                name="shopAddress" 
                value={user.shopAddress} 
                onChange={handleChange}
                placeholder="123 Main St, City, State, Zip"
              />
              {errors.shopAddress && <p className="text-red-500 text-xs">{errors.shopAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Shop Opening Time</Label>
                <Input 
                  id="openingTime" 
                  name="openingTime" 
                  type="time"
                  value={user.openingTime} 
                  onChange={handleChange}
                />
                {errors.openingTime && <p className="text-red-500 text-xs">{errors.openingTime}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingTime">Shop Closing Time</Label>
                <Input 
                  id="closingTime" 
                  name="closingTime" 
                  type="time"
                  value={user.closingTime} 
                  onChange={handleChange}
                />
                {errors.closingTime && <p className="text-red-500 text-xs">{errors.closingTime}</p>}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="register-form" className="w-full">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
