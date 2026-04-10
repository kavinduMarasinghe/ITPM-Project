import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../services/api';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    
    // NIC Details
    nic: {
      number: '',
      frontImage: null,
      backImage: null
    },
    
    // Profile Photo
    profilePhoto: null,
    
    // Organization Information
    organizationName: '',
    organizationType: '',
    organizationAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    organizationPhone: '',
    organizationEmail: '',
    position: '',
    yearsOfExperience: '',
    
    // Additional Documents
    additionalDocuments: [],
    
    // Business Registration
    businessRegistration: {
      registrationNumber: '',
      registrationCertificate: null,
      taxId: ''
    },
    
    // References
    references: [
      { name: '', position: '', organization: '', phone: '', email: '' }
    ],
    
    // Experience & Skills
    eventExperience: {
      hasExperience: false,
      yearsOfEventExperience: 0,
      previousEvents: []
    },
    skills: [],
    
    // Bank Details
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      branch: ''
    },
    
    // Account Security
    password: '',
    confirmPassword: '',
    
    // Terms
    termsAccepted: false,
    agreeToVerification: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [newEvent, setNewEvent] = useState({ eventName: '', eventDate: '', role: '', description: '' });

  // Validation Functions
  const validateFullName = (name) => {
    if (!name) return 'Full name is required';
    if (name.trim().length < 3) return 'Full name must be at least 3 characters';
    if (/[0-9]/.test(name)) return 'Name cannot contain numbers';
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(name)) return 'Name cannot contain special characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number';
    return '';
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return 'Date of birth is required';
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < 18) return 'You must be at least 18 years old';
    } else if (age < 18) return 'You must be at least 18 years old';
    return '';
  };

  const validateGender = (gender) => {
    if (!gender) return 'Gender is required';
    return '';
  };

  const validateAddressField = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return '';
  };

  const validateNIC = (nic) => {
    if (!nic) return 'NIC number is required';
    const nicRegex = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/;
    if (!nicRegex.test(nic)) return 'Please enter a valid NIC number (9 digits + v/x or 12 digits)';
    return '';
  };

  const validateImage = (image, fieldName) => {
    if (!image) return `${fieldName} is required`;
    return '';
  };

  const validateOrganizationName = (name) => {
    if (!name) return 'Organization name is required';
    if (name.trim().length < 2) return 'Organization name must be at least 2 characters';
    return '';
  };

  const validateOrganizationType = (type) => {
    if (!type) return 'Organization type is required';
    return '';
  };

  const validateOrganizationPhone = (phone) => {
    if (!phone) return 'Organization phone is required';
    const phoneRegex = /^[0-9]{10}$|^[0-9]{3}[-][0-9]{7}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) return 'Please enter a valid phone number';
    return '';
  };

  const validateOrganizationEmail = (email) => {
    if (!email) return 'Organization email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePosition = (position) => {
    if (!position) return 'Position is required';
    if (position.trim().length < 2) return 'Position must be at least 2 characters';
    return '';
  };

  const validateYearsOfExperience = (years) => {
    if (!years && years !== 0) return 'Years of experience is required';
    const num = parseInt(years);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 0) return 'Years cannot be negative';
    if (num > 50) return 'Years cannot exceed 50';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirm, password) => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== password) return 'Passwords do not match';
    return '';
  };

  const validateReferenceField = (value, fieldName) => {
    if (value && value.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    return '';
  };

  const validateReferenceEmail = (email) => {
    if (email) {
      const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
      if (!emailRegex.test(email)) return 'Please enter a valid email address';
    }
    return '';
  };

  const validateReferencePhone = (phone) => {
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number';
    }
    return '';
  };

  const validateBankAccountNumber = (account) => {
    if (account && !/^[0-9]{8,20}$/.test(account)) return 'Account number must be 8-20 digits';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: type === 'checkbox' ? checked : value
          }
        }));
        // Clear error for this field
        if (errors[`${parts[0]}.${parts[1]}`]) {
          setErrors(prev => ({ ...prev, [`${parts[0]}.${parts[1]}`]: '' }));
        }
      } else if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]][parts[1]],
              [parts[2]]: value
            }
          }
        }));
        if (errors[`${parts[0]}.${parts[1]}.${parts[2]}`]) {
          setErrors(prev => ({ ...prev, [`${parts[0]}.${parts[1]}.${parts[2]}`]: '' }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    let error = '';
    if (name === 'fullName') error = validateFullName(value);
    else if (name === 'email') error = validateEmail(value);
    else if (name === 'phone') error = validatePhone(value);
    else if (name === 'dateOfBirth') error = validateDateOfBirth(value);
    else if (name === 'gender') error = validateGender(value);
    else if (name === 'address.street') error = validateAddressField(value, 'Street');
    else if (name === 'address.city') error = validateAddressField(value, 'City');
    else if (name === 'address.district') error = validateAddressField(value, 'District');
    else if (name === 'address.postalCode') error = validateAddressField(value, 'Postal Code');
    else if (name === 'nic.number') error = validateNIC(value);
    else if (name === 'organizationName') error = validateOrganizationName(value);
    else if (name === 'organizationType') error = validateOrganizationType(value);
    else if (name === 'organizationPhone') error = validateOrganizationPhone(value);
    else if (name === 'organizationEmail') error = validateOrganizationEmail(value);
    else if (name === 'position') error = validatePosition(value);
    else if (name === 'yearsOfExperience') error = validateYearsOfExperience(value);
    else if (name === 'bankDetails.accountNumber') error = validateBankAccountNumber(value);
    else if (name === 'password') error = validatePassword(value);
    else if (name === 'confirmPassword') error = validateConfirmPassword(value, formData.password);
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleArrayInputChange = (index, field, value) => {
    const updatedReferences = [...formData.references];
    updatedReferences[index][field] = value;
    setFormData(prev => ({ ...prev, references: updatedReferences }));
    
    // Clear error for this reference field
    if (errors[`ref_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`ref_${index}_${field}`]: '' }));
    }
  };

  const handleReferenceBlur = (index, field, value) => {
    let error = '';
    if (field === 'name') error = validateReferenceField(value, 'Name');
    else if (field === 'position') error = validateReferenceField(value, 'Position');
    else if (field === 'organization') error = validateReferenceField(value, 'Organization');
    else if (field === 'email') error = validateReferenceEmail(value);
    else if (field === 'phone') error = validateReferencePhone(value);
    
    setErrors(prev => ({ ...prev, [`ref_${index}_${field}`]: error }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', position: '', organization: '', phone: '', email: '' }]
    }));
  };

  const removeReference = (index) => {
    const updatedReferences = formData.references.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, references: updatedReferences }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addPreviousEvent = () => {
    if (newEvent.eventName && newEvent.eventDate) {
      setFormData(prev => ({
        ...prev,
        eventExperience: {
          ...prev.eventExperience,
          previousEvents: [...prev.eventExperience.previousEvents, newEvent]
        }
      }));
      setNewEvent({ eventName: '', eventDate: '', role: '', description: '' });
    }
  };

  const removePreviousEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      eventExperience: {
        ...prev.eventExperience,
        previousEvents: prev.eventExperience.previousEvents.filter((_, i) => i !== index)
      }
    }));
  };

  const addAdditionalDocument = () => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, { documentName: '', documentUrl: null }]
    }));
  };

  const handleDocumentChange = (index, field, value) => {
    const updatedDocs = [...formData.additionalDocuments];
    updatedDocs[index][field] = value;
    setFormData(prev => ({ ...prev, additionalDocuments: updatedDocs }));
  };

  const removeDocument = (index) => {
    const updatedDocs = formData.additionalDocuments.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, additionalDocuments: updatedDocs }));
  };

  const handleImageUpload = (field, file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG images are allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field.includes('.')) {
          const parts = field.split('.');
          if (parts.length === 2) {
            setFormData(prev => ({
              ...prev,
              [parts[0]]: {
                ...prev[parts[0]],
                [parts[1]]: reader.result
              }
            }));
          } else if (parts.length === 3) {
            setFormData(prev => ({
              ...prev,
              [parts[0]]: {
                ...prev[parts[0]],
                [parts[1]]: {
                  ...prev[parts[0]][parts[1]],
                  [parts[2]]: reader.result
                }
              }
            }));
          }
        } else {
          setFormData(prev => ({ ...prev, [field]: reader.result }));
        }
        // Clear error for this field
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {};
    
    if (currentStep === 1) {
      const fullNameError = validateFullName(formData.fullName);
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);
      const dobError = validateDateOfBirth(formData.dateOfBirth);
      const genderError = validateGender(formData.gender);
      const streetError = validateAddressField(formData.address.street, 'Street');
      const cityError = validateAddressField(formData.address.city, 'City');
      const districtError = validateAddressField(formData.address.district, 'District');
      const postalError = validateAddressField(formData.address.postalCode, 'Postal Code');
      
      if (fullNameError) { newErrors.fullName = fullNameError; isValid = false; }
      if (emailError) { newErrors.email = emailError; isValid = false; }
      if (phoneError) { newErrors.phone = phoneError; isValid = false; }
      if (dobError) { newErrors.dateOfBirth = dobError; isValid = false; }
      if (genderError) { newErrors.gender = genderError; isValid = false; }
      if (streetError) { newErrors['address.street'] = streetError; isValid = false; }
      if (cityError) { newErrors['address.city'] = cityError; isValid = false; }
      if (districtError) { newErrors['address.district'] = districtError; isValid = false; }
      if (postalError) { newErrors['address.postalCode'] = postalError; isValid = false; }
      
    } else if (currentStep === 2) {
      const nicError = validateNIC(formData.nic.number);
      const frontImageError = validateImage(formData.nic.frontImage, 'NIC front image');
      const backImageError = validateImage(formData.nic.backImage, 'NIC back image');
      const profilePhotoError = validateImage(formData.profilePhoto, 'Profile photo');
      
      if (nicError) { newErrors['nic.number'] = nicError; isValid = false; }
      if (frontImageError) { newErrors['nic.frontImage'] = frontImageError; isValid = false; }
      if (backImageError) { newErrors['nic.backImage'] = backImageError; isValid = false; }
      if (profilePhotoError) { newErrors.profilePhoto = profilePhotoError; isValid = false; }
      
    } else if (currentStep === 3) {
      const orgNameError = validateOrganizationName(formData.organizationName);
      const orgTypeError = validateOrganizationType(formData.organizationType);
      const orgPhoneError = validateOrganizationPhone(formData.organizationPhone);
      const orgEmailError = validateOrganizationEmail(formData.organizationEmail);
      const positionError = validatePosition(formData.position);
      const yearsError = validateYearsOfExperience(formData.yearsOfExperience);
      const orgStreetError = validateAddressField(formData.organizationAddress.street, 'Street');
      const orgCityError = validateAddressField(formData.organizationAddress.city, 'City');
      const orgDistrictError = validateAddressField(formData.organizationAddress.district, 'District');
      const orgPostalError = validateAddressField(formData.organizationAddress.postalCode, 'Postal Code');
      
      if (orgNameError) { newErrors.organizationName = orgNameError; isValid = false; }
      if (orgTypeError) { newErrors.organizationType = orgTypeError; isValid = false; }
      if (orgPhoneError) { newErrors.organizationPhone = orgPhoneError; isValid = false; }
      if (orgEmailError) { newErrors.organizationEmail = orgEmailError; isValid = false; }
      if (positionError) { newErrors.position = positionError; isValid = false; }
      if (yearsError) { newErrors.yearsOfExperience = yearsError; isValid = false; }
      if (orgStreetError) { newErrors['organizationAddress.street'] = orgStreetError; isValid = false; }
      if (orgCityError) { newErrors['organizationAddress.city'] = orgCityError; isValid = false; }
      if (orgDistrictError) { newErrors['organizationAddress.district'] = orgDistrictError; isValid = false; }
      if (orgPostalError) { newErrors['organizationAddress.postalCode'] = orgPostalError; isValid = false; }
      
    } else if (currentStep === 4) {
      const bankAccountError = validateBankAccountNumber(formData.bankDetails.accountNumber);

      if (bankAccountError) {
        newErrors['bankDetails.accountNumber'] = bankAccountError;
        isValid = false;
      }

    } else if (currentStep === 5) {
      const passwordError = validatePassword(formData.password);
      const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
      
      if (passwordError) { newErrors.password = passwordError; isValid = false; }
      if (confirmError) { newErrors.confirmPassword = confirmError; isValid = false; }
      if (!formData.termsAccepted) { newErrors.termsAccepted = 'You must accept the terms and conditions'; isValid = false; }
      if (!formData.agreeToVerification) { newErrors.agreeToVerification = 'You must agree to the verification process'; isValid = false; }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setShowPreview(true);
    }
  };

  const confirmSubmit = async () => {
    try {
      const response = await api.registerOrganizer(formData);
      setSubmissionResult(response.data);
      setSubmitted(true);
      setShowPreview(false);
      window.scrollTo(0, 0);
    } catch (error) {
      alert(error.message || "Failed to submit organizer registration");
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: { street: '', city: '', district: '', postalCode: '' },
      nic: { number: '', frontImage: null, backImage: null },
      profilePhoto: null,
      organizationName: '',
      organizationType: '',
      organizationAddress: { street: '', city: '', district: '', postalCode: '' },
      organizationPhone: '',
      organizationEmail: '',
      position: '',
      yearsOfExperience: '',
      additionalDocuments: [],
      businessRegistration: { registrationNumber: '', registrationCertificate: null, taxId: '' },
      references: [{ name: '', position: '', organization: '', phone: '', email: '' }],
      eventExperience: { hasExperience: false, yearsOfEventExperience: 0, previousEvents: [] },
      skills: [],
      bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', branch: '' },
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      agreeToVerification: false
    });
    setCurrentStep(1);
    setSubmitted(false);
    setSubmissionResult(null);
    setSkillInput('');
    setNewEvent({ eventName: '', eventDate: '', role: '', description: '' });
    setErrors({});
    setTouched({});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering as an organizer. Your account is now pending Head Organizer approval before login access is enabled.
            </p>
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">Registration ID: <span className="font-mono font-bold">{submissionResult?.id || 'PENDING'}</span></p>
              <p className="text-sm text-gray-700 mt-1">Check your email for confirmation: <span className="font-medium">{formData.email}</span></p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={resetForm}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-200"
              >
                Register Another Organizer
              </button>
              <button
                onClick={() => navigate('/login', { state: { message: 'Organization registration submitted. Wait for approval before logging in.' } })}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent";
    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 bg-red-50`;
    }
    return `${baseClass} border-gray-300`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Organizer Registration</h1>
          <p className="text-gray-600">Join our platform as an event organizer</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                <p className={`text-xs mt-2 text-center ${
                  currentStep >= step ? 'text-orange-600 font-medium' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Documents'}
                  {step === 3 && 'Organization'}
                  {step === 4 && 'Professional'}
                  {step === 5 && 'Security'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-600 pb-2 inline-block">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('fullName')}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('email')}
                    placeholder="you@example.com"
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('phone')}
                    placeholder="0712345678"
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('dateOfBirth')}
                  />
                  {errors.dateOfBirth && touched.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && touched.gender && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('address.street')}
                      placeholder="Street Address"
                    />
                    {errors['address.street'] && touched['address.street'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['address.street']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('address.city')}
                      placeholder="City"
                    />
                    {errors['address.city'] && touched['address.city'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['address.city']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('address.district')}
                      placeholder="District"
                    />
                    {errors['address.district'] && touched['address.district'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['address.district']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('address.postalCode')}
                      placeholder="Postal Code"
                    />
                    {errors['address.postalCode'] && touched['address.postalCode'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['address.postalCode']}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-600 pb-2 inline-block">
                Verification Documents
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number *</label>
                <input
                  type="text"
                  name="nic.number"
                  value={formData.nic.number}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('nic.number')}
                  placeholder="123456789V or 123456789012"
                />
                {errors['nic.number'] && touched['nic.number'] && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors['nic.number']}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC Front Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('nic.frontImage', e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {errors['nic.frontImage'] && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors['nic.frontImage']}</p>
                  )}
                  {formData.nic.frontImage && (
                    <img src={formData.nic.frontImage} alt="NIC Front" className="mt-2 h-32 object-cover rounded-lg" />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC Back Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('nic.backImage', e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {errors['nic.backImage'] && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors['nic.backImage']}</p>
                  )}
                  {formData.nic.backImage && (
                    <img src={formData.nic.backImage} alt="NIC Back" className="mt-2 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('profilePhoto', e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.profilePhoto && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.profilePhoto}</p>
                )}
                {formData.profilePhoto && (
                  <img src={formData.profilePhoto} alt="Profile" className="mt-2 h-32 w-32 object-cover rounded-full" />
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={addAdditionalDocument}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Add Additional Document
                </button>
                
                {formData.additionalDocuments.map((doc, index) => (
                  <div key={index} className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Document Name"
                      value={doc.documentName}
                      onChange={(e) => handleDocumentChange(index, 'documentName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-2"
                    />
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentChange(index, 'documentUrl', e.target.files[0])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="mt-2 text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Organization Information */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-600 pb-2 inline-block">
                Organization Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('organizationName')}
                  />
                  {errors.organizationName && touched.organizationName && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.organizationName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type *</label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('organizationType')}
                  >
                    <option value="">Select Type</option>
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Educational">Educational</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.organizationType && touched.organizationType && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.organizationType}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Phone *</label>
                  <input
                    type="tel"
                    name="organizationPhone"
                    value={formData.organizationPhone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('organizationPhone')}
                  />
                  {errors.organizationPhone && touched.organizationPhone && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.organizationPhone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Email *</label>
                  <input
                    type="email"
                    name="organizationEmail"
                    value={formData.organizationEmail}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('organizationEmail')}
                  />
                  {errors.organizationEmail && touched.organizationEmail && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.organizationEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('position')}
                  />
                  {errors.position && touched.position && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('yearsOfExperience')}
                    min="0"
                    max="50"
                  />
                  {errors.yearsOfExperience && touched.yearsOfExperience && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.yearsOfExperience}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Address *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="organizationAddress.street"
                      value={formData.organizationAddress.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('organizationAddress.street')}
                      placeholder="Street Address"
                    />
                    {errors['organizationAddress.street'] && touched['organizationAddress.street'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['organizationAddress.street']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="organizationAddress.city"
                      value={formData.organizationAddress.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('organizationAddress.city')}
                      placeholder="City"
                    />
                    {errors['organizationAddress.city'] && touched['organizationAddress.city'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['organizationAddress.city']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="organizationAddress.district"
                      value={formData.organizationAddress.district}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('organizationAddress.district')}
                      placeholder="District"
                    />
                    {errors['organizationAddress.district'] && touched['organizationAddress.district'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['organizationAddress.district']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="organizationAddress.postalCode"
                      value={formData.organizationAddress.postalCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('organizationAddress.postalCode')}
                      placeholder="Postal Code"
                    />
                    {errors['organizationAddress.postalCode'] && touched['organizationAddress.postalCode'] && (
                      <p className="text-red-500 text-xs mt-1 error-message">{errors['organizationAddress.postalCode']}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Registration (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="businessRegistration.registrationNumber"
                      value={formData.businessRegistration.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="Registration Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="businessRegistration.taxId"
                      value={formData.businessRegistration.taxId}
                      onChange={handleInputChange}
                      placeholder="Tax ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Certificate</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleImageUpload('businessRegistration.registrationCertificate', e.target.files[0])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Professional Information */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-600 pb-2 inline-block">
                Professional Information
              </h2>
              
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    name="eventExperience.hasExperience"
                    checked={formData.eventExperience.hasExperience}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">I have previous event organizing experience</span>
                </label>
                
                {formData.eventExperience.hasExperience && (
                  <div className="ml-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Event Experience</label>
                      <input
                        type="number"
                        name="eventExperience.yearsOfEventExperience"
                        value={formData.eventExperience.yearsOfEventExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Previous Events</h4>
                      <div className="space-y-3">
                        {formData.eventExperience.previousEvents.map((event, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium">{event.eventName}</p>
                            <p className="text-sm text-gray-600">{event.eventDate}</p>
                            <p className="text-sm text-gray-600">Role: {event.role}</p>
                            <button
                              type="button"
                              onClick={() => removePreviousEvent(index)}
                              className="text-red-600 text-sm mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Event Name"
                            value={newEvent.eventName}
                            onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="date"
                            placeholder="Event Date"
                            value={newEvent.eventDate}
                            onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Your Role"
                            value={newEvent.role}
                            onChange={(e) => setNewEvent({ ...newEvent, role: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <textarea
                            placeholder="Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            rows="2"
                          />
                          <button
                            type="button"
                            onClick={addPreviousEvent}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                          >
                            Add Event
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill (e.g., Event Planning)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-orange-700 hover:text-orange-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                {formData.references.map((ref, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Name"
                          value={ref.name}
                          onChange={(e) => handleArrayInputChange(index, 'name', e.target.value)}
                          onBlur={(e) => handleReferenceBlur(index, 'name', e.target.value)}
                          className={`px-4 py-2 border rounded-lg ${
                            errors[`ref_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`ref_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_name`]}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Position"
                          value={ref.position}
                          onChange={(e) => handleArrayInputChange(index, 'position', e.target.value)}
                          onBlur={(e) => handleReferenceBlur(index, 'position', e.target.value)}
                          className={`px-4 py-2 border rounded-lg ${
                            errors[`ref_${index}_position`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`ref_${index}_position`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_position`]}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Organization"
                          value={ref.organization}
                          onChange={(e) => handleArrayInputChange(index, 'organization', e.target.value)}
                          onBlur={(e) => handleReferenceBlur(index, 'organization', e.target.value)}
                          className={`px-4 py-2 border rounded-lg ${
                            errors[`ref_${index}_organization`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`ref_${index}_organization`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_organization`]}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={ref.phone}
                          onChange={(e) => handleArrayInputChange(index, 'phone', e.target.value)}
                          onBlur={(e) => handleReferenceBlur(index, 'phone', e.target.value)}
                          className={`px-4 py-2 border rounded-lg ${
                            errors[`ref_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`ref_${index}_phone`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_phone`]}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={ref.email}
                          onChange={(e) => handleArrayInputChange(index, 'email', e.target.value)}
                          onBlur={(e) => handleReferenceBlur(index, 'email', e.target.value)}
                          className={`px-4 py-2 border rounded-lg ${
                            errors[`ref_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`ref_${index}_email`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_email`]}</p>
                        )}
                      </div>
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeReference(index)}
                        className="mt-2 text-red-600 text-sm"
                      >
                        Remove Reference
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReference}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Add Another Reference
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details (For Payments)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="bankDetails.accountHolderName"
                      value={formData.bankDetails.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="Account Holder Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="bankDetails.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Account Number"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors['bankDetails.accountNumber'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['bankDetails.accountNumber'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['bankDetails.accountNumber']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="bankDetails.bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleInputChange}
                      placeholder="Bank Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="bankDetails.branch"
                      value={formData.bankDetails.branch}
                      onChange={handleInputChange}
                      placeholder="Branch"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Security & Terms */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-600 pb-2 inline-block">
                Account Security
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('password')}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('confirmPassword')}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">
                    I accept the <span className="text-orange-600 font-medium">Terms and Conditions</span> *
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.termsAccepted}</p>
                )}
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="agreeToVerification"
                    checked={formData.agreeToVerification}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">I agree to the verification process and confirm that all information provided is accurate *</span>
                </label>
                {errors.agreeToVerification && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.agreeToVerification}</p>
                )}
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> By submitting this registration, you confirm that all information provided is true and accurate. 
                  Any false information may lead to rejection of your application or suspension of your account.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200"
              >
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all duration-200 ml-auto"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 ml-auto"
              >
                Submit Registration
              </button>
            )}
          </div>
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">Personal Information</h3>
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                  <p><strong>Gender:</strong> {formData.gender}</p>
                  <p><strong>Address:</strong> {formData.address.street}, {formData.address.city}, {formData.address.district}, {formData.address.postalCode}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">Organization Information</h3>
                  <p><strong>Organization:</strong> {formData.organizationName}</p>
                  <p><strong>Type:</strong> {formData.organizationType}</p>
                  <p><strong>Position:</strong> {formData.position}</p>
                  <p><strong>Experience:</strong> {formData.yearsOfExperience} years</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, i) => (
                      <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
