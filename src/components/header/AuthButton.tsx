import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "../ui/button";

interface AuthButtonProps {
  user: any;
  profile: any;
}

const AuthButton = ({ user, profile }: AuthButtonProps) => {
  if (user) {
    const getProfileLink = () => {
      if (profile?.role === 'admin') return "/admin";
      if (profile?.account_type === 'company') return "/company-account";
      return "/account";
    };

    return (
      <Button asChild variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent hover:text-accent-foreground" title={profile?.role === 'admin' ? "Admin Menu" : profile?.account_type === 'company' ? "Firemní účet" : "Můj profil"}>
        <Link to={getProfileLink()}>
          <User className="w-5 h-5" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="sm">
      <Link to="/login">Přihlásit se</Link>
    </Button>
  );
};

export default AuthButton;
