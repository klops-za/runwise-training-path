
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Apple, Shield, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const KnowledgeHub = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'recovery',
      title: 'Recovery & Rest',
      description: 'Learn about proper recovery techniques, sleep optimization, and injury prevention',
      icon: Heart,
      color: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      articles: [
        'The Science of Recovery: Why Rest Days Matter',
        'Sleep Optimization for Runners',
        'Active Recovery Techniques',
        'Foam Rolling and Stretching Guide'
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition & Hydration',
      description: 'Fuel your training with proper nutrition strategies and hydration tips',
      icon: Apple,
      color: 'from-orange-100 to-orange-200',
      iconColor: 'text-orange-600',
      articles: [
        'Pre-Run Nutrition: What to Eat and When',
        'During-Race Fueling Strategies',
        'Post-Workout Recovery Nutrition',
        'Hydration Guidelines for Distance Running'
      ]
    },
    {
      id: 'injury-prevention',
      title: 'Injury Prevention',
      description: 'Stay healthy with injury prevention strategies and early warning signs',
      icon: Shield,
      color: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      articles: [
        'Common Running Injuries and Prevention',
        'Strength Training for Runners',
        'Running Form Analysis',
        'When to See a Sports Medicine Doctor'
      ]
    },
    {
      id: 'mental-prep',
      title: 'Mental Preparation',
      description: 'Develop mental toughness and race-day psychology techniques',
      icon: Brain,
      color: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      articles: [
        'Race Day Mental Strategies',
        'Visualization Techniques for Runners',
        'Dealing with Training Plateaus',
        'Building Mental Resilience'
      ]
    }
  ];

  const featuredArticles = [
    {
      title: "The Complete Guide to Half Marathon Training",
      excerpt: "Everything you need to know about preparing for your first (or fastest) 13.1-mile race.",
      readTime: "12 min read",
      category: "Training"
    },
    {
      title: "Pacing Strategies for Race Success",
      excerpt: "Learn how to pace yourself for optimal performance across different race distances.",
      readTime: "8 min read",
      category: "Strategy"
    },
    {
      title: "Building Your Running Base Safely",
      excerpt: "How to increase your weekly mileage without risking injury or burnout.",
      readTime: "10 min read",
      category: "Training"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Knowledge Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights and proven strategies to help you train smarter, run faster, and stay injury-free
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="border-blue-100 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader>
                  <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-orange-100 rounded-lg mb-4"></div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">{article.category}</span>
                    <span className="text-gray-500">{article.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="border-gray-200 hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${category.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {category.articles.map((article, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                          {article}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => navigate(`/knowledge/${category.id}`)}
                    >
                      Explore {category.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">💡 Quick Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-blue-50">
              <strong>Listen to your body:</strong> If you're feeling unusually fatigued or experiencing pain, 
              it's better to take an extra rest day than to risk injury. Your training plan should adapt to you, 
              not the other way around.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeHub;
