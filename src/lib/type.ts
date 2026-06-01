import { Attendee, CtaTypeEnum } from "@prisma/client";

export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  valid: boolean;
  errors: ValidationErrors;
};

export const validateCTA = (data: {
  ctaLabel?: string;
  tags?: string[];
  ctaType: string;
  aiAgent?: string;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  if (!data.ctaLabel?.trim()) {
    errors.ctaLabel = "CTA label is required";
  }

  if (!data.ctaType) {
    errors.ctaType = "Please select a CTA type";
  }

  if (
    data.ctaType === CtaTypeEnum.BOOK_A_CALL &&
    !data.aiAgent?.trim()
  ) {
    errors.aiAgent = "Select an AI agent for Book a Call";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateBasicInfo = (data: {
  webinarName?: string;
  description?: string;
  date?: Date;
  time?: string;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  if (!data.webinarName?.trim()) {
    errors.webinarName = "Webinar name is required";
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  }

  if (!data.date) {
    errors.date = "Date is required";
  }

  if (!data.time?.trim()) {
    errors.time = "Time is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
export const validateAdditionalInfo = (data: {
  lockChat?: boolean;
  couponCode?: string;
  couponEnabled?: boolean;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  // If coupon is enabled, code is required
  if (data.couponEnabled && !data.couponCode?.trim()) {
    errors.couponCode = "Coupon code is required when enabled";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProductInfo = (data: {
  productTitle?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  if (!data.productTitle?.trim()) {
    errors.productTitle = "Product title is required";
  }

  if (data.price === undefined || data.price < 0) {
    errors.price = "Valid price is required";
  }

  if (!data.currency) {
    errors.currency = "Currency is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export type AttendanceData = {
  count: number;
  users: Attendee[];
};
