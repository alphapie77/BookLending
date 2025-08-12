// Simple test script to verify API connectivity
import { homeService } from './services/api'

const testAPI = async () => {
  console.log('Testing API connectivity...')
  
  try {
    console.log('Testing statistics endpoint...')
    const statsResponse = await homeService.getStatistics()
    console.log('Statistics response:', statsResponse.data)
  } catch (error) {
    console.error('Statistics API error:', error)
  }
  
  try {
    console.log('Testing featured books endpoint...')
    const booksResponse = await homeService.getFeaturedBooks()
    console.log('Featured books response:', booksResponse.data)
  } catch (error) {
    console.error('Featured books API error:', error)
  }
}

// Run the test
testAPI()