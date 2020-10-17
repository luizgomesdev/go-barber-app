import React, { createContext, useCallback, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface AuthStateDTO {
    token: string;
    user: object;
}
interface SignInCredentials {
    email: string;
    password: string;
}
interface AuthContextDTO {
    user: object;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextDTO>({} as AuthContextDTO);

export const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<AuthStateDTO>({} as AuthStateDTO);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadStorageData(): Promise<void> {
            const [token, user] = await AsyncStorage.multiGet(['@GoBarber:token', '@GoBarber:user']);
            if (token[1] && user[1]) {
                setData({ token: token[1], user: JSON.parse(user[1]) });
            }

            setLoading(false);
        }

        loadStorageData();
    }, [data]);

    const signIn = useCallback(async ({ email, password }) => {
        const response = await api.post('/sessions', { email, password });

        const { token, user } = response.data;

        await AsyncStorage.multiSet([
            ['@GoBarber:token', token],
            ['@GoBarber:user', JSON.stringify(user)],
        ]);

        setData({ token, user });
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.multiRemove(['@GoBarber:token', '@GoBarber:user']);

        setData({} as AuthStateDTO);
    }, []);

    return <AuthContext.Provider value={{ user: data.user, signIn, signOut, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextDTO => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }

    return context;
};
