import React, { useCallback, useRef } from 'react';
import { Image, View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';

import * as Yup from 'yup';
import getValidationErros from '../../utils/getValidationErros';

import { useAuth } from '../../hooks/Auth';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import { Container, Title, ForgotPassword, ForgotPassowrdText, CreateAccountButton, CreateAccountButtonText } from './styles';

interface signInFormDTO {
    email: string;
    password: string;
}

const SingIn: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const navigation = useNavigation();

    const { signIn } = useAuth();

    const handleSignIn = useCallback(
        async (data: signInFormDTO) => {
            try {
                formRef.current?.setErrors({});
                const schema = Yup.object().shape({
                    email: Yup.string().required('E-mail obrigatório').email('Digite um e-mail válido'),
                    password: Yup.string().required('Senha obrigatória'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                await signIn({ email: data.email, password: data.password });
            } catch (error) {
                if (error instanceof Yup.ValidationError) {
                    const erros = getValidationErros(error);
                    formRef.current?.setErrors(erros);
                } else {
                    Alert.alert('Error na autenticação', 'Credenciais inválidas');
                }
            }
        },
        [signIn],
    );

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flex: 1 }}>
                    <Container style={{ flex: 1, backgroundColor: '#312e38' }}>
                        <Image source={logoImg} />
                        <View>
                            <Title>Faça seu Logon</Title>
                        </View>

                        <Form ref={formRef} onSubmit={handleSignIn}>
                            <Input
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                autoCorrect={false}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={passwordInputRef}
                                name="password"
                                icon="lock"
                                placeholder="Senha"
                                secureTextEntry
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    formRef.current?.submitForm();
                                }}
                            />
                        </Form>
                        <Button
                            onPress={() => {
                                formRef.current?.submitForm();
                            }}
                        >
                            Entrar
                        </Button>

                        <ForgotPassword onPress={() => {}}>
                            <ForgotPassowrdText>Esqueci minha senha</ForgotPassowrdText>
                        </ForgotPassword>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>

            <CreateAccountButton
                onPress={() => {
                    navigation.navigate('SignUp');
                }}
            >
                <Icon name="log-in" size={20} color="#ff9000" />
                <CreateAccountButtonText>Criar uma conta</CreateAccountButtonText>
            </CreateAccountButton>
        </>
    );
};

export default SingIn;
