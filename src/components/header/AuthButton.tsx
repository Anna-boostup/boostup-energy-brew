import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "../ui/button";

interface AuthButtonProps {
  user: any;
  profile: any;
}

const AuthButton = ({ user, profile }: AuthButtonProps) => {
  if (user) {
    return (
      <Button asChild variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent hover:text-accent-foreground" title={profile?.account_type === 'company' ? "Firemní účet" : "Můj profil"}>
        <Link to={profile?.account_type === 'company' ? "/company-account" : "/account"}>
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
