import OpenAI from 'openai';
import { logAuditEvent } from './security';
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { isConnected } from './db/mongodb';
import { mongoStorage } from './db/mongo-storage';
import { storage } from './storage';
import type { Doctor } from '@shared/schema';

// Use a placeholder key for development - in production, this would be an actual API key
const DUMMY_KEY = 'dummy_sk_openai_key';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || DUMMY_KEY, 
});

// System prompt for health coach assistant
const HEALTH_COACH_SYSTEM_PROMPT = `
You are a helpful healthcare assistant providing preliminary guidance. 
Remember to:
- Always include disclaimers that you're not a doctor and cannot provide medical diagnoses
- Provide general health information that might be useful for the user
- Suggest when the user should consider consulting a real healthcare professional
- Maintain a calm, caring, and professional tone
- Be concise and clear in your responses
- Do not provide specific treatment recommendations or diagnoses
- Focus on general health education and guidance
- Never claim to be a licensed medical professional
`;

// Interface for the health analysis result
export interface HealthAnalysisResult {
  analysis: string;
  recommendations: string;
  severity: 'low' | 'medium' | 'high';
}

// Function to generate a health analysis based on symptoms
export async function analyzeHealthSymptoms(userId: number, symptomsDescription: string): Promise<HealthAnalysisResult> {
  try {
    // Log health consultation request for HIPAA compliance
    logAuditEvent(userId, 'request', 'healthAnalysis', userId.toString(), `User requested health analysis`);

    // If we have a valid API key, use OpenAI API
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== DUMMY_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { 
            role: "system", 
            content: HEALTH_COACH_SYSTEM_PROMPT 
          },
          { 
            role: "user", 
            content: `Please analyze these health symptoms: ${symptomsDescription}

Provide your response in JSON format with the following fields:
- analysis: Your analysis of the symptoms
- recommendations: General health recommendations
- severity: A rating of 'low', 'medium', or 'high' based on urgency`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content || '{}');
      
      // Log successful analysis
      logAuditEvent(userId, 'complete', 'healthAnalysis', userId.toString(), `Health analysis completed successfully`);
      
      return {
        analysis: result.analysis,
        recommendations: result.recommendations,
        severity: result.severity as 'low' | 'medium' | 'high'
      };
    } else {
      // Use a fallback mechanism for demo or when API key is not available
      return generateFallbackAnalysis(symptomsDescription);
    }
  } catch (error) {
    console.error('Error analyzing health symptoms:', error);
    // Log error
    logAuditEvent(userId, 'error', 'healthAnalysis', userId.toString(), `Error analyzing health symptoms`);
    
    // Return a safe fallback response
    return {
      analysis: "I'm sorry, but I couldn't analyze your symptoms at this time. There might be a technical issue.",
      recommendations: "Please try again later or speak with a healthcare professional if you're concerned about your symptoms.",
      severity: "medium"
    };
  }
}

// Generate a fallback analysis based on symptom keywords
function generateFallbackAnalysis(symptomsDescription: string): HealthAnalysisResult {
  const symptoms = symptomsDescription.toLowerCase();
  let severity: 'low' | 'medium' | 'high' = 'low';
  let analysis = "";
  let recommendations = "";
  
  // Check for common symptom patterns and determine likely response
  if (symptoms.includes('headache') || symptoms.includes('head pain')) {
    analysis = "Headaches can have many causes including stress, dehydration, eye strain, or more serious conditions.";
    recommendations = "Try resting in a dark room, staying hydrated, and taking over-the-counter pain relievers if appropriate. If headaches persist or are severe, consult a healthcare professional.";
    severity = symptoms.includes('severe') ? 'medium' : 'low';
  } else if (symptoms.includes('fever') || symptoms.includes('temperature')) {
    analysis = "Fever is often a sign that your body is fighting an infection.";
    recommendations = "Rest, stay hydrated, and monitor your temperature. If fever exceeds 103°F (39.4°C) or lasts more than three days, seek medical attention.";
    severity = symptoms.includes('high fever') || symptoms.includes('very hot') ? 'medium' : 'low';
  } else if (symptoms.includes('cough') || symptoms.includes('sore throat')) {
    analysis = "Coughs and sore throats are common with colds, flu, allergies, or respiratory infections.";
    recommendations = "Rest your voice, stay hydrated, and try warm liquids or lozenges. If symptoms persist more than a week or include difficulty breathing, see a doctor.";
    severity = (symptoms.includes('can\'t breathe') || symptoms.includes('difficulty breathing')) ? 'high' : 'low';
  } else if (symptoms.includes('chest pain') || symptoms.includes('heart')) {
    analysis = "Chest pain can have various causes from muscle strain to more serious cardiac conditions.";
    recommendations = "Chest pain, especially with shortness of breath, sweating, or pain radiating to arm/jaw, requires immediate medical attention. Please call emergency services or go to an emergency room.";
    severity = 'high';
  } else if (symptoms.includes('stomach') || symptoms.includes('nausea') || symptoms.includes('vomit')) {
    analysis = "Stomach discomfort, nausea, or vomiting can result from food poisoning, viruses, or digestive issues.";
    recommendations = "Try small sips of clear fluids, rest your stomach, and gradually return to normal diet. If symptoms persist more than 2 days or include severe pain, see a doctor.";
    severity = symptoms.includes('blood') ? 'high' : 'low';
  } else if (symptoms.includes('dizzy') || symptoms.includes('lightheaded')) {
    analysis = "Dizziness can result from dehydration, inner ear issues, low blood pressure, or medication effects.";
    recommendations = "Sit or lie down immediately when feeling dizzy, stay hydrated, and avoid sudden movements. See a doctor if dizziness persists or recurs frequently.";
    severity = 'medium';
  } else {
    // Generic response for other symptoms
    analysis = "I've noted your symptoms, but I'm not able to provide a specific analysis without a proper medical examination.";
    recommendations = "Monitor your symptoms and consider consulting a healthcare professional if they persist or worsen. Keep track of any changes in how you feel to share with your doctor.";
    severity = 'medium';
  }
  
  // Add disclaimer
  analysis += "\n\nRemember, this is not a medical diagnosis, just general information based on the symptoms you've described.";
  
  return {
    analysis,
    recommendations,
    severity
  };
}

// Function to simulate a chat conversation with health assistant
export async function chatWithHealthAssistant(userId: number, message: string): Promise<string> {
  try {
    // Log health chat request for HIPAA compliance
    logAuditEvent(userId, 'request', 'healthChat', userId.toString(), `User chat with health assistant`);

    // Debug environment variables
    console.log('Environment check:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
      OLLAMA_HOST: process.env.OLLAMA_HOST || 'Not set',
      NODE_ENV: process.env.NODE_ENV
    });

    // If we have a valid API key, use OpenAI API
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== DUMMY_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: HEALTH_COACH_SYSTEM_PROMPT 
          },
          { 
            role: "user", 
            content: message
          }
        ]
      });

      const content = response.choices[0].message.content;
      
      // Log successful chat
      logAuditEvent(userId, 'complete', 'healthChat', userId.toString(), `Health chat completed successfully with OpenAI`);
      
      return content || "I'm sorry, I couldn't generate a response. Please try again.";
    } 
    // If OpenAI is not available, try Ollama
  else if (process.env.OLLAMA_HOST) {
      console.log('Attempting to use Ollama at:', process.env.OLLAMA_HOST);
      try {
        const ollama = new ChatOllama({
          baseUrl: process.env.OLLAMA_HOST,
          model: "llama3:8b"
        });

        // 1️⃣ Enhanced prompt to extract both symptoms and location
        const extractionPrompt = `
You are a medical and geographic assistant AI. Extract the following details from the user input:
- Symptoms (simple names, comma-separated)
- Location information (extract and classify area, city, state, and country from natural language)

Respond ONLY in this JSON format:

{
  "symptoms": ["symptom1", "symptom2"],
  "location": {
    "name": "extracted location name",
    "type": "city | state | country | area | unknown",
    "area": "area name",
    "city": "city name",
    "state": "state name",
    "country": "country name"
  }
}

Guidelines:
- Extract symptoms as simple terms (e.g., "headache", "fever", "cough")
- For location:
  * First identify the location type (city, state, country, or area)
  * Then extract the location name
  * Place the location in the correct field based on its type
  * Examples:
    - "I'm in New York" → type: "city", city: "New York"
    - "Living in California" → type: "state", state: "California"
    - "From USA" → type: "country", country: "USA"
    - "In West Village" → type: "area", area: "West Village"
  * If a field is not provided, leave it as an empty string
  * If location type is unknown, set type to "unknown" and leave all fields empty
  * Be smart about location extraction:
    - If someone says "I'm in New York", extract "New York" as the city
    - If someone mentions a state without a city, leave city empty but fill the state
    - If someone mentions a country without other details, fill only the country field
    - For cities, extract the full name (e.g., "San Francisco" not just "SF")

Input:
"${message}"
        `;

        const extractionResponse = await ollama.call([
          new SystemMessage("You extract medical symptoms and classify locations from natural language."),
          new HumanMessage(extractionPrompt)
        ]);

        console.log('Extracted info:', extractionResponse.content);

        const {
          symptoms = [],
          location = {
            name: "",
            type: "unknown",
            area: "",
            city: "",
            state: "",
            country: ""
          }
        } = JSON.parse(extractionResponse.content?.toString() || "{}");

        console.log('Parsed location:', location);

        const formattedSymptoms = symptoms.map((s: string) => s.trim().toLowerCase());
        console.log('Formatted symptoms:', formattedSymptoms);

        // 2️⃣ Get all doctors
        const doctorStorage = isConnected() ? mongoStorage : storage;
        console.log('Using storage:', isConnected() ? 'MongoDB' : 'Memory');
        const allDoctors = await doctorStorage.getAllDoctors();

        // 3️⃣ Filter doctors by symptoms and location
        const matchingDoctors = allDoctors.filter((doctor: Doctor) => {
          // First check if doctor has any of the user's symptoms
          const matchesSymptom = formattedSymptoms.some((symptom: string) =>
            (doctor as any).symptoms?.some((docSymptom: string) =>
              docSymptom.toLowerCase().includes(symptom)
            )
          );

          if (!matchesSymptom) {
            console.log(`Doctor ${(doctor as any).name} doesn't match symptoms`);
            return false;
          }

          // If no location specified, return all doctors with matching symptoms
          if (!location.type || location.type === 'unknown') {
            console.log('No location type specified, returning all doctors with matching symptoms');
            return true;
          }

          // More precise location matching based on location type
          const doctorLocation = {
            city: (doctor as any).city?.toLowerCase().trim() || '',
            state: (doctor as any).state?.toLowerCase().trim() || '',
            country: (doctor as any).country?.toLowerCase().trim() || '',
            area: (doctor as any).area?.toLowerCase().trim() || ''
          };

          const userLocation = {
            city: location.city?.toLowerCase().trim() || '',
            state: location.state?.toLowerCase().trim() || '',
            country: location.country?.toLowerCase().trim() || '',
            area: location.area?.toLowerCase().trim() || ''
          };

          console.log('Comparing locations:', {
            doctor: doctorLocation,
            user: userLocation,
            doctorName: (doctor as any).name,
            locationType: location.type
          });

          // Match based on the specific location type provided
          switch (location.type) {
            case 'city':
              return doctorLocation.city === userLocation.city;
            case 'state':
              return doctorLocation.state === userLocation.state;
            case 'country':
              return doctorLocation.country === userLocation.country;
            case 'area':
              return doctorLocation.area === userLocation.area;
            default:
              return false;
          }
        });

        console.log('Matching doctors count:', matchingDoctors.length);

        // Sort doctors by relevance (exact matches first)
        const sortedDoctors = matchingDoctors.sort((a: Doctor, b: Doctor) => {
          // Then sort by number of matching symptoms
          const aMatchingSymptoms = formattedSymptoms.filter((symptom: string) =>
            (a as any).symptoms?.some((s: string) => s.toLowerCase().includes(symptom))
          ).length;

          const bMatchingSymptoms = formattedSymptoms.filter((symptom: string) =>
            (b as any).symptoms?.some((s: string) => s.toLowerCase().includes(symptom))
          ).length;

          return bMatchingSymptoms - aMatchingSymptoms;
        });

        console.log('Sorted doctors count:', sortedDoctors.length);

        // 4️⃣ Format matched doctor info
        const doctorList = sortedDoctors.map((doctor: Doctor) => `
Dr. ${(doctor as any).name || 'Name not available'}
Specialty: ${doctor.specialty}
Location: ${[
  (doctor as any).area,
  (doctor as any).city,
  (doctor as any).state,
  (doctor as any).country
].filter(Boolean).join(', ')}
Symptoms: ${(doctor as any).symptoms?.join(', ')}
Availability: ${(doctor as any).available ? 'Available' : 'Not Available'}
        `).join('\n\n');

        // 5️⃣ Response handling
        if (sortedDoctors.length === 0) {
          console.log('No matching doctors found, trying to find doctors by symptoms only');
          // Try to find doctors by symptoms only if no location match is found
          const doctorsBySymptoms = allDoctors.filter((doctor: Doctor) =>
            formattedSymptoms.some((symptom: string) =>
              (doctor as any).symptoms?.some((docSymptom: string) =>
                docSymptom.toLowerCase().includes(symptom)
              )
            )
          );

          if (doctorsBySymptoms.length > 0) {
            const locationInfo = location.name || [location.area, location.city, location.state, location.country].filter(Boolean).join(', ');
            return `I found doctors who specialize in your symptoms, but none in ${locationInfo}. Here are some doctors who can help with your symptoms:\n\n${
              doctorsBySymptoms.map((doctor: Doctor) => `
Dr. ${(doctor as any).name || 'Name not available'}
Specialty: ${doctor.specialty}
Location: ${[
  (doctor as any).area,
  (doctor as any).city,
  (doctor as any).state,
  (doctor as any).country
].filter(Boolean).join(', ')}
Symptoms: ${(doctor as any).symptoms?.join(', ')}
Availability: ${(doctor as any).available ? 'Available' : 'Not Available'}
              `).join('\n\n')
            }\n\nPlease consult a healthcare professional for proper diagnosis.`;
          }
          
          return "I couldn't find any doctors matching your symptoms. Please try providing different symptoms or check your location info.";
        }

        const locationInfo = location.name || [location.area, location.city, location.state, location.country].filter(Boolean).join(', ');

        const finalResponse = `Based on your symptoms (${formattedSymptoms.join(', ')}) and location (${locationInfo}), here are matching doctors:\n\n${doctorList}\n\nPlease consult a healthcare professional for proper diagnosis.`;

        logAuditEvent(userId, 'complete', 'healthChat', userId.toString(), `Doctors found successfully for symptoms: ${formattedSymptoms.join(', ')}`);
        return finalResponse;

      } catch (ollamaError) {
        console.error('Error with Ollama:', ollamaError);
        if (ollamaError instanceof Error) {
          console.error('Ollama error details:', ollamaError.message);
        }
        return "I'm sorry, I couldn't process your request. Please try again.";
      }
    } else {
      console.log('Neither OpenAI nor Ollama is available, using fallback');
      return generateFallbackChatResponse(message);
    }
  } catch (error) {
    console.error('Error chatting with health assistant:', error);
    // Log error
    logAuditEvent(userId, 'error', 'healthChat', userId.toString(), `Error in health chat`);
    
    // Return a safe fallback response
    return "I'm sorry, but I couldn't process your message at this time. There might be a technical issue. Please try again later or speak with a healthcare professional if you have health concerns.";
  }
}

// Generate a fallback chat response
function generateFallbackChatResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm your health assistant. How can I help you today? Please remember that I can provide general health information, but I'm not a substitute for professional medical advice.";
  } else if (msg.includes('how are you')) {
    return "I'm here and ready to assist you with health information. How are you feeling today? Is there something specific about your health that you'd like to discuss?";
  } else if (msg.includes('thank')) {
    return "You're welcome! If you have any other health-related questions, feel free to ask. Remember to consult with healthcare professionals for personalized medical advice.";
  } else if (msg.includes('help')) {
    return "I can provide general health information and guidance. To help you better, please share specific health concerns or questions you have. Remember that I'm not a replacement for professional medical care.";
  } else if (msg.includes('doctor')) {
    return "While I can provide general health information, I'm not a doctor. For specific medical concerns, diagnosis, or treatment, it's important to consult with a qualified healthcare professional.";
  } else if (msg.includes('exercise') || msg.includes('workout')) {
    return "Regular exercise is beneficial for both physical and mental health. The CDC recommends at least 150 minutes of moderate-intensity activity per week. Before starting a new exercise program, especially if you have existing health conditions, it's advisable to consult with a healthcare provider.";
  } else if (msg.includes('diet') || msg.includes('nutrition') || msg.includes('eat')) {
    return "A balanced diet is essential for good health. Try to include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Individual nutritional needs can vary, so consider consulting with a dietitian for personalized advice.";
  } else if (msg.includes('sleep')) {
    return "Quality sleep is crucial for health. Adults typically need 7-9 hours of sleep per night. If you're having persistent sleep problems, consider discussing them with a healthcare provider, as they could impact various aspects of your health.";
  } else if (msg.includes('stress') || msg.includes('anxiety')) {
    return "Managing stress is important for overall well-being. Techniques like deep breathing, mindfulness meditation, regular exercise, and adequate sleep can help. If stress or anxiety is significantly affecting your daily life, consider seeking support from a mental health professional.";
  } else {
    return "Thank you for your message. I'm here to provide general health information, but I'm not a medical professional. For specific health concerns, it's best to consult with a healthcare provider who can give personalized advice based on your individual health situation.";
  }
}
