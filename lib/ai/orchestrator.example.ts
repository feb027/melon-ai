/**
 * Example usage of AI Orchestrator
 * 
 * This file demonstrates how to use the AI orchestrator service
 * for watermelon analysis with automatic fallback and retry logic.
 */

import { analyzeImage, aiOrchestrator, AIServiceError } from './orchestrator';

/**
 * Example 1: Simple analysis using convenience function
 */
async function simpleAnalysisExample() {
  try {
    const imageUrl = 'https://example.com/watermelon.jpg';
    
    console.log('Starting watermelon analysis...');
    const result = await analyzeImage(imageUrl);
    
    console.log('Analysis Result:');
    console.log('- Maturity Status:', result.maturityStatus);
    console.log('- Confidence:', result.confidence + '%');
    console.log('- Sweetness Level:', result.sweetnessLevel + '/10');
    console.log('- Watermelon Type:', result.watermelonType);
    console.log('- Skin Quality:', result.skinQuality);
    console.log('- Reasoning:', result.reasoning);
  } catch (error) {
    if (error instanceof AIServiceError) {
      console.error('AI Service Error:', error.message);
      console.error('Failed Provider:', error.provider);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

/**
 * Example 2: Using AIProviderManager directly
 */
async function advancedAnalysisExample() {
  try {
    const imageUrl = 'https://example.com/watermelon.jpg';
    
    // Analyze image
    const result = await aiOrchestrator.analyzeImage(imageUrl);
    
    console.log('Analysis completed successfully!');
    console.log(result);
    
    // Get provider statistics
    const stats = await aiOrchestrator.getProviderStatistics(100);
    
    console.log('\nProvider Statistics:');
    stats.forEach(stat => {
      console.log(`\n${stat.provider}:`);
      console.log(`  Total Requests: ${stat.totalRequests}`);
      console.log(`  Success Rate: ${stat.successRate.toFixed(2)}%`);
      console.log(`  Avg Response Time: ${stat.avgResponseTime.toFixed(0)}ms`);
    });
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

/**
 * Example 3: Error handling with retry logic
 */
async function errorHandlingExample() {
  const imageUrl = 'https://example.com/watermelon.jpg';
  
  try {
    const result = await analyzeImage(imageUrl);
    console.log('Success:', result.maturityStatus);
  } catch (error) {
    if (error instanceof AIServiceError) {
      // All providers failed
      console.error('All AI providers failed after retries');
      console.error('Last provider:', error.provider);
      
      // You could implement fallback logic here:
      // - Save to offline queue
      // - Notify user to try again later
      // - Use cached result if available
    }
  }
}

/**
 * Example 4: Monitoring provider performance
 */
async function monitoringExample() {
  // Get statistics for the last 100 requests
  const stats = await aiOrchestrator.getProviderStatistics(100);
  
  // Find the best performing provider
  const bestProvider = stats.reduce((best, current) => {
    if (current.successRate > best.successRate) return current;
    if (current.successRate === best.successRate && 
        current.avgResponseTime < best.avgResponseTime) return current;
    return best;
  });
  
  console.log('Best Performing Provider:', bestProvider.provider);
  console.log('Success Rate:', bestProvider.successRate.toFixed(2) + '%');
  console.log('Avg Response Time:', bestProvider.avgResponseTime.toFixed(0) + 'ms');
}

// Export examples for testing
export {
  simpleAnalysisExample,
  advancedAnalysisExample,
  errorHandlingExample,
  monitoringExample,
};
