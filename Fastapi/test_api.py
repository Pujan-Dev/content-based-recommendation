"""
Test script for Recommendation API

Run this after starting the FastAPI server to verify all endpoints work correctly.

Usage:
    python test_api.py
"""

import requests
import json
from typing import Dict, Any

# API Configuration
BASE_URL = "http://localhost:8000"

def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)

def test_root_endpoint():
    """Test the root endpoint."""
    print_section("TEST 1: Root Endpoint")
    
    response = requests.get(f"{BASE_URL}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200, "Root endpoint failed"
    print("PASSED")

def test_health_endpoint():
    """Test the health check endpoint."""
    print_section("TEST 2: Health Check Endpoint")
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    assert response.status_code == 200, "Health check failed"
    assert data['status'] == 'healthy', "Service not healthy"
    assert data['posts_loaded'] > 0, "No posts loaded"
    assert data['users_loaded'] > 0, "No users loaded"
    
    print("PASSED")

def test_recommendations_user1():
    """Test recommendations for User 1 (tech_gamer_2026)."""
    print_section("TEST 3: Recommendations for User 1 (tech_gamer_2026)")
    
    user_id = "user_001"
    k = 5
    
    response = requests.get(f"{BASE_URL}/recommendations", params={
        "user_id": user_id,
        "k": k
    })
    
    print(f"Status Code: {response.status_code}")
    
    data = response.json()
    print(f"\nUser ID: {data['user_id']}")
    print(f"Timestamp: {data['timestamp']}")
    print(f"Total Candidates: {data['total_candidates']}")
    print(f"Filtered Count: {data['filtered_count']}")
    print(f"\nTop {len(data['recommendations'])} Recommendations:")
    print(f"{'Rank':<5} {'Category':<18} {'Title':<40} {'Score':<8}")
    print("-" * 80)
    
    for i, rec in enumerate(data['recommendations'], 1):
        title_short = rec['title'][:40]
        print(f"{i:<5} {rec['category']:<18} {title_short:<40} {rec['score']:<8.3f}")
    
    assert response.status_code == 200, "Recommendations failed"
    assert len(data['recommendations']) > 0, "No recommendations returned"
    assert len(data['recommendations']) <= k, f"Too many recommendations (expected <= {k})"
    
    print("\nPASSED")

def test_recommendations_user2():
    """Test recommendations for User 2 (wellness_chef_2026)."""
    print_section("TEST 4: Recommendations for User 2 (wellness_chef_2026)")
    
    user_id = "user_002"
    k = 5
    
    response = requests.get(f"{BASE_URL}/recommendations", params={
        "user_id": user_id,
        "k": k
    })
    
    print(f"Status Code: {response.status_code}")
    
    data = response.json()
    print(f"\nUser ID: {data['user_id']}")
    print(f"Timestamp: {data['timestamp']}")
    print(f"Total Candidates: {data['total_candidates']}")
    print(f"Filtered Count: {data['filtered_count']}")
    print(f"\nTop {len(data['recommendations'])} Recommendations:")
    print(f"{'Rank':<5} {'Category':<18} {'Title':<40} {'Score':<8}")
    print("-" * 80)
    
    for i, rec in enumerate(data['recommendations'], 1):
        title_short = rec['title'][:40]
        print(f"{i:<5} {rec['category']:<18} {title_short:<40} {rec['score']:<8.3f}")
    
    assert response.status_code == 200, "Recommendations failed"
    assert len(data['recommendations']) > 0, "No recommendations returned"
    assert len(data['recommendations']) <= k, f"Too many recommendations (expected <= {k})"
    
    print("\nPASSED")

def test_invalid_user():
    """Test error handling for invalid user."""
    print_section("TEST 5: Invalid User Error Handling")
    
    user_id = "invalid_user_999"
    
    response = requests.get(f"{BASE_URL}/recommendations", params={
        "user_id": user_id
    })
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 404, "Should return 404 for invalid user"
    
    print("PASSED")

def test_detailed_recommendation_structure():
    """Test that recommendation structure contains all required fields."""
    print_section("TEST 6: Recommendation Structure Validation")
    
    response = requests.get(f"{BASE_URL}/recommendations", params={
        "user_id": "user_001",
        "k": 1
    })
    
    data = response.json()
    rec = data['recommendations'][0]
    
    required_fields = [
        'post_id', 'title', 'category', 'score',
        'engagement_score', 'recency_weight', 'distance'
    ]
    
    print("Checking required fields in recommendation:")
    for field in required_fields:
        assert field in rec, f"Missing field: {field}"
        print(f"  {field}: {rec[field]}")
    
    # Type checks
    assert isinstance(rec['post_id'], str), "post_id should be string"
    assert isinstance(rec['title'], str), "title should be string"
    assert isinstance(rec['category'], str), "category should be string"
    assert isinstance(rec['score'], (int, float)), "score should be numeric"
    assert isinstance(rec['engagement_score'], (int, float)), "engagement_score should be numeric"
    assert isinstance(rec['recency_weight'], (int, float)), "recency_weight should be numeric"
    assert isinstance(rec['distance'], (int, float)), "distance should be numeric"
    
    print("\nPASSED")

def run_all_tests():
    """Run all API tests."""
    print("\n")
    print("*" * 80)
    print(" RECOMMENDATION API TEST SUITE")
    print("*" * 80)
    
    try:
        test_root_endpoint()
        test_health_endpoint()
        test_recommendations_user1()
        test_recommendations_user2()
        test_invalid_user()
        test_detailed_recommendation_structure()
        
        print_section("ALL TESTS PASSED")
        print("\nThe Recommendation API is working correctly!")
        print("Server is ready for production use.")
        
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
        return False
    except requests.exceptions.ConnectionError:
        print("\nERROR: Cannot connect to API server!")
        print("Please ensure the server is running:")
        print("  python main.py")
        return False
    except Exception as e:
        print(f"\nUNEXPECTED ERROR: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
