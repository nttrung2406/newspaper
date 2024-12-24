import mongoose from 'mongoose';

const membershipsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Approved', 'Pending', 'Rejected'], 
    required: true 
  },
  writer: { 
    type: String, 
    default: null 
  },
  editor: { 
    type: String, 
    default: null 
  },
  rejectionReason: { 
    type: String, 
    default: null 
  },
  category: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  tags: { 
    type: [String], 
    default: [] 
  }
});

// Tạo model từ schema
const Membership = mongoose.model('Membership', membershipsSchema);

export default Membership;
