export interface BaseModalProps {
  onClose: () => void;
  isOpen: boolean;
}

export interface BaseFormProps {
  onFormLoadingChange?: (isLoading: boolean) => void;
  onFormSubmitSuccess?: () => void;
  renderActionsContainer: (context: {
    onSubmitButtonPressed: () => void;
    isLoading: boolean;
    isValid: boolean;
    isDirty: boolean;
  }) => JSX.Element;
}

export interface SignUpFormData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAndConditions: boolean;
}

export interface ChangePasswordFormData {
  newPassword: string;
  confirmNewPassword: string;
}

export interface EditNameFormData {
  name: string;
  lastName: string;
}

export interface AuthenticationFormData {
  password: string;
}
