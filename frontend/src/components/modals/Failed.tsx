import { Button, Dialog, DialogPanel, Description, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

interface FailedProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText: string;
  onConfirm: () => void;
}

export default function Failed({
  isOpen,
  title,
  message,
  buttonText,
  onConfirm,
} : FailedProps) {

  return (
      <Dialog open={isOpen} as="div" className="relative z-[100] focus:outline-none" onClose={() => {}}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel transition className="w-full max-w-md rounded-xl bg-white shadow-xl p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <img className='mx-auto w-1/3 saturate-200' src="/fail.gif"/>
              <DialogTitle as="h2" className=" capitalize text-center text-4xl text-gray-900 font-[700]">
                {title}
              </DialogTitle>

              <Description as="p" className="mt-4 text-center text-sm/6 text-gray-500">
                {message}
              </Description>
              
              <div className="mt-8 flex justify-end">
                <Button 
                className="inline-flex items-center gap-2 bg-red-500 rounded-md hover:bg-red-600 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none"
                onClick={onConfirm}>
                  {buttonText}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
  )
}