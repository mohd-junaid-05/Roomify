interface AuthState {
    isSignIn : boolean,
    userName : string | null,
    userId : string | null
}

type AuthContext = {
    isSignIn : boolean,
    userName : string | null,
    userId : string | null
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
}