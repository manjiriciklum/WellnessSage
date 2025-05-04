import OpenAI from 'openai';
import { logAuditEvent } from './security';

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
            content: message
          }
        ]
      });

      const content = response.choices[0].message.content;
      
      // Log successful chat
      logAuditEvent(userId, 'complete', 'healthChat', userId.toString(), `Health chat completed successfully`);
      
      return content || "I'm sorry, I couldn't generate a response. Please try again.";
    } else {
      // Use a fallback mechanism for demo or when API key is not available
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
