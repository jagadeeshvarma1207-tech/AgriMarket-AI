/**
 * AgriMarket AI — Quality Assessment Service Interface
 *
 * This file defines the stable public interface for the AI quality assessment system.
 * It currently returns clearly-marked PLACEHOLDER results.
 *
 * TO CONNECT A REAL MODEL:
 * 1. Replace the `analyzeProduceQuality` function body with real API call
 * 2. Keep the function signature and return type identical
 * 3. Update `modelVersion` to reflect the real model version
 * 4. Set `isPlaceholder: false` in the returned result
 *
 * The rest of the application code does NOT need to change.
 */

export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'UNGRADED'

export interface AIQualityResult {
  grade: QualityGrade
  confidence: number // 0-100
  detectedFeatures: string[]
  recommendations: string[]
  modelVersion: string
  analysisTimestamp: string
  produceType: string | null
  isPlaceholder: boolean
  error?: string
}

export interface AIAnalysisRequest {
  imagePath: string
  produceHint?: string // Optional hint to help model focus (e.g., "tomato", "mango")
}

// ─── GRADE DESCRIPTIONS ────────────────────────────────────────────────────────

export const GRADE_INFO: Record<QualityGrade, { label: string; color: string; description: string }> = {
  A: {
    label: 'Grade A — Premium',
    color: '#22c55e',
    description: 'Excellent quality. Superior appearance, optimal ripeness, no defects.',
  },
  B: {
    label: 'Grade B — Good',
    color: '#84cc16',
    description: 'Good quality. Minor imperfections, suitable for market.',
  },
  C: {
    label: 'Grade C — Fair',
    color: '#f59e0b',
    description: 'Acceptable quality. Visible minor defects but still wholesome.',
  },
  D: {
    label: 'Grade D — Poor',
    color: '#ef4444',
    description: 'Below standard quality. Significant defects or over-ripeness detected.',
  },
  UNGRADED: {
    label: 'Not Graded',
    color: '#6b7280',
    description: 'Quality assessment not yet performed.',
  },
}

// ─── PLACEHOLDER IMPLEMENTATION ────────────────────────────────────────────────

/**
 * PLACEHOLDER AI Quality Analysis
 * Returns demo results clearly marked as placeholders.
 * Replace this implementation with real model inference when ready.
 */
export async function analyzeProduceQuality(
  request: AIAnalysisRequest
): Promise<AIQualityResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // If real AI API URL is configured, call it
  if (process.env.AI_MODEL_API_URL) {
    try {
      return await callRealModelAPI(request)
    } catch (err) {
      console.error('[AI Service] Real model API failed, falling back to placeholder:', err)
    }
  }

  // ─── PLACEHOLDER RESULT ─────────────────────────────────────────────────────
  // This is demo output — clearly marked as placeholder
  const grades: QualityGrade[] = ['A', 'B', 'C', 'D']
  const selectedGrade = grades[Math.floor(Math.random() * grades.length)]

  const featuresMap: Record<QualityGrade, string[]> = {
    A: [
      'Vibrant natural color detected',
      'No visible surface blemishes',
      'Optimal size and shape',
      'Fresh appearance',
      'No signs of overripeness',
    ],
    B: [
      'Good color with minor variation',
      'Very minor surface marks',
      'Acceptable size and shape',
      'Generally fresh appearance',
    ],
    C: [
      'Some color inconsistency detected',
      'Minor surface blemishes present',
      'Slight size irregularity',
      'Beginning signs of aging',
    ],
    D: [
      'Significant color changes',
      'Visible surface damage or bruising',
      'Shape irregularity detected',
      'Signs of overripeness or deterioration',
    ],
    UNGRADED: [],
  }

  const recommendationsMap: Record<QualityGrade, string[]> = {
    A: [
      'Ideal for premium market listing',
      'Can command higher price point',
      'Excellent for direct-to-consumer sale',
    ],
    B: [
      'Suitable for standard market listing',
      'Price at standard market rate',
      'Good for most consumer use cases',
    ],
    C: [
      'Consider processing or bulk pricing',
      'Sell quickly to avoid further degradation',
      'Suitable for processing or cooking use',
    ],
    D: [
      'Not recommended for fresh market sale',
      'Consider composting or animal feed',
      'Review storage and handling practices',
    ],
    UNGRADED: [],
  }

  return {
    grade: selectedGrade,
    confidence: Math.round(60 + Math.random() * 30), // 60-90% for demo
    detectedFeatures: featuresMap[selectedGrade],
    recommendations: recommendationsMap[selectedGrade],
    modelVersion: 'placeholder-v0.1 (DEMO)',
    analysisTimestamp: new Date().toISOString(),
    produceType: request.produceHint || 'General Produce',
    isPlaceholder: true,
  }
}

// ─── REAL MODEL API STUB ────────────────────────────────────────────────────────

/**
 * Calls the real trained model API when AI_MODEL_API_URL is configured.
 * Implement this function body when the real model is ready.
 */
async function callRealModelAPI(request: AIAnalysisRequest): Promise<AIQualityResult> {
  const response = await fetch(process.env.AI_MODEL_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_MODEL_API_KEY}`,
    },
    body: JSON.stringify({
      imagePath: request.imagePath,
      produceHint: request.produceHint,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API returned ${response.status}`)
  }

  const data = await response.json()

  // Map real model response to our interface
  // Adjust field mapping based on actual model response structure
  return {
    grade: data.grade,
    confidence: data.confidence,
    detectedFeatures: data.features || [],
    recommendations: data.recommendations || [],
    modelVersion: data.modelVersion || 'real-model-v1',
    analysisTimestamp: new Date().toISOString(),
    produceType: data.produceType || request.produceHint || null,
    isPlaceholder: false,
  }
}
