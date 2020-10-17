import React, { useCallback, useRef } from 'react';

import { Image, View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';

import * as Yup from 'yup';
import getValidationErros from '../../utils/getValidationErros';

import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';

interface SignUpformDTO {
    name: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    const navigation = useNavigation();
    const formRef = useRef<FormHandles>(null);

    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const handleSignUp = useCallback(async (data: SignUpformDTO) => {
        try {
            formRef.current?.setErrors({});
            const schema = Yup.object().shape({
                name: Yup.string().required('Nome obrigatório'),
                email: Yup.string().required('E-mail obrigatório').email('Digite um e-mail válido'),
                password: Yup.string().min(6, 'No mínimo 6 dígitos'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/users', data);

            Alert.alert('Cadastro realizado com sucesso!', 'Você já pode fazer login.');

            navigation.goBack();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const erros = getValidationErros(error);

                formRef.current?.setErrors(erros);
            } else {
                Alert.alert('Erro no cadastro', 'Tente novamente mais tarde.');
            }

            console.log(error);
        }
    }, []);
    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flex: 1 }}>
                    <Container style={{ flex: 1, backgroundColor: '#312e38' }}>
                        <Image source={logoImg} />
                        <View>
                            <Title>Crie sua conta</Title>
                        </View>
                        <Form ref={formRef} onSubmit={handleSignUp}>
                            <Input
                                name="name"
                                icon="user"
                                placeholder="Nome"
                                autoCorrect
                                autoCapitalize="words"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailInputRef.current?.focus();
                                }}
                            />

                            <Input
                                ref={emailInputRef}
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                keyboardType="email-address"
                                autoCorrect={false}
                                autoCapitalize="none"
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
                                textContentType="newPassword"
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
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>

            <BackToSignIn
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <Icon name="arrow-left" size={20} color="#fff" />
                <BackToSignInText>Voltar para o logon</BackToSignInText>
            </BackToSignIn>
        </>
    );
};

export default SignUp;
