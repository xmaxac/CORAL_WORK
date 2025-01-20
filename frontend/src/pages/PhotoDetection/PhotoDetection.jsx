import React, {useRef, useState} from 'react'
import { Upload, XCircle, Camera } from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

const PhotoDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    console.log('Uploading image for SCTLD Detection:', selectedImage);    
  }

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUserDevice = (e) => {
    toast.error('Sorry, your device is not supported for this feature', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
    });
  };


  return (
    <div className='max-w-2xl mx-auto mt-5 space-x-2'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Upload size={20} />
            <span>SCTLD Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center space-y-4'>
            <div
              className={`w-full h-96 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors ${!selectedImage ? 'border-slate-300 hover:border-slate-400 bg-slate-50' : 'border-transparent'}`}
            >
              {!selectedImage ? (
                <div className='w-full h-full flex flex-col items-center justify-center space-y-4'>
                  <label className='flex flex-col items-center justify-center cursor-pointer'>
                    <Upload className='w-8 h-8 text-slate-400 mb-2' />
                    <span className='text-sm text-slate-600 text-center'>
                      Click or drag image here
                    </span>
                    <input 
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleImageSelect}
                    />
                  </label>

                  <input 
                    ref={cameraInputRef}
                    type='file'
                    accept='image/*'
                    capture='enviroment'
                    className='hidden'
                    onChange={handleImageSelect}
                  />

                  <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2'>
                    <span className='text-sm text-slate-400'>or</span>
                    <Button
                      variant='outline'
                      onClick={isMobile ? openCamera : () => handleUserDevice()}
                      className="flex items-center space-x-2"
                    >
                      <Camera size={16} />
                      <span>Take Photo</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='relative w-full h-full'>
                  <img 
                    src={previewUrl}
                    alt='Preview'
                    className='w-full h-full object-contain rounded-lg'
                  />
                </div>
              )}
            </div>

            {selectedImage && (
              <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4'>
                <Button
                  variant='outline'
                  onClick={handleClear}
                  className="flex items-center justify-center space-x-2"
                > 
                  <XCircle size={16} />
                  <span>Clear</span>
                </Button>
                <Button
                  onClick={handleUpload}
                  className="flex items-center justify-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PhotoDetection