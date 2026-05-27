import { CtaTypeEnum } from "@prisma/client";
import {
  validateAdditionalInfo,
  validateBasicInfo,
  validateCTA,
  validateProductInfo,
  ValidationErrors,
  ValidationResult,
} from "@/lib/type";
import { create } from "zustand";

export type WebinarFormState = {
  basicInfo: {
    webinarName?: string;
    description?: string;
    date?: Date;
    time?: string;
    timeFormat?: "AM" | "PM";
  };

  cta: {
    ctaLabel?: string;
    tags?: string[];
    ctaType: CtaTypeEnum;
    aiAgent?: string;
    priceId?: string;
  };

  additionalInfo: {
    lockChat?: boolean;
    couponCode?: string;
    couponEnabled?: boolean;
  };
  productInfo: {
    productTitle?: string;
    price?: number;
    currency?: string;
    originalPrice?: number;
  };
};

type ValidationState = {
  basicInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };

  cta: {
    valid: boolean;
    errors: ValidationErrors;
  };

  additionalInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };

  productInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
};

type WebinarStore = {
  isModalOpen: boolean;
  isComplete: boolean;
  isSubmitting: boolean;
  formData: WebinarFormState;
  validation: ValidationState;

  setModalOpen: (open: boolean) => void;
  setComplete: (complete: boolean) => void;
  setSubmitting: (submitting: boolean) => void;

  updateBasicInfoField: <K extends keyof WebinarFormState["basicInfo"]>(
    field: K,
    value: WebinarFormState["basicInfo"][K],
  ) => void;

  updateCTAField: <K extends keyof WebinarFormState["cta"]>(
    field: K,
    value: WebinarFormState["cta"][K],
  ) => void;

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  updateAdditionalInfoField: <
    K extends keyof WebinarFormState["additionalInfo"],
  >(
    field: K,
    value: WebinarFormState["additionalInfo"][K],
  ) => void;

  updateProductInfoField: <K extends keyof WebinarFormState["productInfo"]>(
    field: K,
    value: WebinarFormState["productInfo"][K],
  ) => void;

  validateStep: (stepId: keyof WebinarFormState) => boolean;

  getStepValidationErrors: (stepId: keyof WebinarFormState) => ValidationErrors;

  resetForm: () => void;
};

const initialState: WebinarFormState = {
  basicInfo: {
    webinarName: "",
    description: "",
    date: undefined,
    time: "",
    timeFormat: "AM",
  },

  cta: {
    ctaLabel: "",
    tags: [],
    ctaType: "BOOK_A_CALL",
    aiAgent: "",
    priceId: "",
  },

  additionalInfo: {
    lockChat: false,
    couponCode: "",
    couponEnabled: false,
  },
  productInfo: {
    productTitle: "",
    price: 0,
    currency: "INR",
    originalPrice: 0,
  },
};
const initialValidation: ValidationState = {
  basicInfo: { valid: false, errors: {} },

  cta: { valid: false, errors: {} },

  additionalInfo: { valid: true, errors: {} },

  productInfo: { valid: false, errors: {} },
};

export const useWebinarStore = create<WebinarStore>((set, get) => ({
  isModalOpen: false,
  isComplete: false,
  isSubmitting: false,
  formData: initialState,
  validation: initialValidation,

  updateBasicInfoField: (field, value) => {
    set((state) => {
      const newBasicInfo = {
        ...state.formData.basicInfo,
        [field]: value,
      };

      const validationResult = validateBasicInfo(newBasicInfo);

      return {
        formData: {
          ...state.formData,
          basicInfo: newBasicInfo,
        },

        validation: {
          ...state.validation,
          basicInfo: validationResult,
        },
      };
    });
  },
  updateCTAField: (field, value) => {
    set((state) => {
      const newCTA = {
        ...state.formData.cta,
        [field]: value,
      };

      const validationResult = validateCTA(newCTA);
      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },

        validation: {
          ...state.validation,
          cta: validationResult,
        },
      };
    });
  },
  updateAdditionalInfoField: (field, value) => {
    set((state) => {
      const newAdditionalInfo = {
        ...state.formData.additionalInfo,
        [field]: value,
      };

      const validationResult = validateAdditionalInfo(newAdditionalInfo);

      return {
        formData: {
          ...state.formData,
          additionalInfo: newAdditionalInfo,
        },

        validation: {
          ...state.validation,
          additionalInfo: validationResult,
        },
      };
    });
  },

  updateProductInfoField: (field, value) => {
    set((state) => {
      const newProductInfo = {
        ...state.formData.productInfo,
        [field]: value,
      };

      const validationResult = validateProductInfo(newProductInfo);

      return {
        formData: {
          ...state.formData,
          productInfo: newProductInfo,
        },
        validation: {
          ...state.validation,
          productInfo: validationResult,
        },
      };
    });
  },

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),

  setComplete: (complete: boolean) => set({ isComplete: complete }),

  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  validateStep: (stepId: keyof WebinarFormState) => {
    const formData = get().formData;

    let validationResult: ValidationResult;

    switch (stepId) {
      case "basicInfo":
        validationResult = validateBasicInfo(formData.basicInfo);
        break;

      case "cta":
        validationResult = validateCTA(formData.cta);
        break;

      case "additionalInfo":
        validationResult = validateAdditionalInfo(formData.additionalInfo);
        break;

      case "productInfo":
        validationResult = validateProductInfo(formData.productInfo);
        break;
    }

    set((state) => {
      return {
        validation: {
          ...state.validation,
          [stepId]: validationResult,
        },
      };
    });

    return validationResult.valid;
  },
  getStepValidationErrors: (stepId: keyof WebinarFormState) => {
    return get().validation[stepId].errors;
  },

  resetForm: () =>
    set({
      isModalOpen: false,
      isComplete: false,
      isSubmitting: false,
      formData: initialState,
      validation: initialValidation,
    }),

  addTag: (tag: string) =>
    set((state) => {
      const newTags = [...(state.formData.cta.tags || []), tag];

      const newCTA = {
        ...state.formData.cta,
        tags: newTags,
      };

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
      };
    }),

  removeTag: (tagToRemove) =>
    set((state) => {
      const newTags = (state.formData.cta.tags || []).filter(
        (tag) => tag !== tagToRemove,
      );

      const newCTA = {
        ...state.formData.cta,
        tags: newTags,
      };

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
      };
    }),
}));
